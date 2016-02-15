'use strict';

var app = angular.module('app', [
    'app.config',
    'ngRoute',
    'ngAnimate',
    'ngCookies',
    'toaster',
    'angular-loading-bar',
    'angular-jwt',
    'ui.gravatar',
    'sca-shared',
]);

//show loading bar at the top
app.config(['cfpLoadingBarProvider', '$logProvider', function(cfpLoadingBarProvider, $logProvider) {
    //console.log("bar provider");
    cfpLoadingBarProvider.includeSpinner = false;
    //$logProvider.debugEnabled(true); //I read it's enabled by default
}]);

//configure route
app.config(['$routeProvider', 'appconf', function($routeProvider, appconf) {
    $routeProvider.
    when('/settings', {
        templateUrl: 't/settings.html',
        controller: 'SettingsController',
        requiresLogin: true,
        /*
        resolve: {
            menuservice: function(menuservice) {
                return menuservice;
            }
        }
        */
    })
    .otherwise({
        redirectTo: '/settings'
    });
}]).run(['$rootScope', '$location', 'toaster', 'jwtHelper', 'appconf', function($rootScope, $location, toaster, jwtHelper, appconf) {
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        //console.log("route changed from "+current+" to :"+next);
        //redirect to /login if user hasn't authenticated yet
        if(next.requiresLogin) {
            var jwt = localStorage.getItem(appconf.jwt_id);
            if(jwt == null || jwtHelper.isTokenExpired(jwt)) {
                //TODO - use $cookies.set("messages") to send messages to user service
                //toaster.warning("Please login first");
                sessionStorage.setItem('auth_redirect', window.location);
                window.location = appconf.auth_url;
                event.preventDefault();
            }
        }
    });
}]);

//configure httpProvider to send jwt unless skipAuthorization is set in config (not tested yet..)
app.config(['appconf', '$httpProvider', 'jwtInterceptorProvider', 
function(appconf, $httpProvider, jwtInterceptorProvider) {
    jwtInterceptorProvider.tokenGetter = function(jwtHelper, config, $http) {
        //don't send jwt for template requests
        if (config.url.substr(config.url.length - 5) == '.html') {
            return null;
        }
        var jwt = localStorage.getItem(appconf.jwt_id);
        if(!jwt) return null; //not jwt

        //TODO - I should probably put this in $interval instead so that jwt will be renewed regardless
        //of if user access server or not.. (as long as the page is opened?)
        //(also, make it part of shared or auth module?)
        var expdate = jwtHelper.getTokenExpirationDate(jwt);
        var ttl = expdate - Date.now();
        if(ttl < 0) {
            console.log("jwt expired");
            return null;
        } else if(ttl < 3600*1000) {
            //console.dir(config);
            console.log("jwt expiring in an hour.. refreshing first");
            //jwt expring in less than an hour! refresh!
            return $http({
                url: appconf.auth_api+'/refresh',
                skipAuthorization: true,  //prevent infinite recursion
                headers: {'Authorization': 'Bearer '+jwt},
                method: 'POST'
            }).then(function(response) {
                var jwt = response.data.jwt;
                //console.log("got renewed jwt:"+jwt);
                localStorage.setItem(appconf.jwt_id, jwt);
                return jwt;
            });
        }
        return jwt;
    }
    $httpProvider.interceptors.push('jwtInterceptor');
}]);

app.factory('menu', ['appconf', '$http', 'jwtHelper', '$sce', 'scaMessage', 'scaMenu', '$q', '$timeout', 'toaster',
function(appconf, $http, jwtHelper, $sce, scaMessage, scaMenu, $q, $timeout, toaster) {
    var menu = {
        header: {
            //label: appconf.title,
        },
        top: scaMenu,
        user: null, //to-be-loaded
        //_profile: null, //to-be-loaded
    };
    if(appconf.icon_url) menu.header.icon = $sce.trustAsHtml("<img src=\""+appconf.icon_url+"\">");
    if(appconf.home_url) menu.header.url = appconf.home_url

    var jwt = localStorage.getItem(appconf.jwt_id);
    if(jwt) menu.user = jwtHelper.decodeToken(jwt);
    return menu;
    /*
    if(menu.user) {
        //load user profile if user is logged in
        return $http.get(appconf.api+'/public/'+menu.user.sub).then(function(res) {
            menu._profile = res.data;
            return menu;
        }, function(err) {
            console.dir(err);
            toaster.error(err.statusText);
        });
    } else {
        //guest doesn't have any profile.. resolve immediately
        return $q.when(menu);
    }
    */
}]);

