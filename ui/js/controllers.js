

app.controller('HeaderController', ['$scope', 'appconf', '$route', 'toaster', '$http', 'jwtHelper', 'menu',
function($scope, appconf, $route, toaster, $http, jwtHelper, menu) {
    $scope.title = appconf.title;
    //serverconf.then(function(_c) { $scope.serverconf = _c; });
    $scope.menu = menu;
    $scope.user = menu.user; //for app menu
}]);

app.controller('SettingsController', ['$scope', 'appconf', '$route', 'toaster', '$http', 'jwtHelper', 'scaMessage', 'scaSettingsMenu',
function($scope, appconf, $route, toaster, $http, jwtHelper, scaMessage, scaSettingsMenu) {
    $scope.appconf = appconf;
    scaMessage.show(toaster);

    //for app menu
    $scope.settings_menu = scaSettingsMenu;

    var jwt = localStorage.getItem(appconf.jwt_id);
    var user = jwtHelper.decodeToken(jwt);

    /*
    //load user public info
    $http.get(appconf.api+'/public/'+user.sub)
    .success(function(profile, status, headers, config) {
        $scope.form_profile = profile;
    })
    .error(function(data, status, headers, config) {
        if(data && data.message) {
            toaster.error(data.message);
        }
    }); 
    */
    //let's reuse the user profile already loaded
    $scope.form_profile = $scope.menu._profile;

    /*
    //load user info
    $http.get(appconf.auth_api+'/me')
    .success(function(info) {
        $scope.user = info;
    });
    */
    
    /*
    $http.get(appconf.shared_api+'/menu/top').then(function(res) { 
        $scope.top_menu = res.data; 
    });
    $http.get(appconf.shared_api+'/menu/settings') .then(function(res) { $scope.settings_menu = res.data; });
    */
    
    $scope.submit_profile = function() {
        $http.put(appconf.api+'/public/'+user.sub, $scope.form_profile)
        .success(function(data, status, headers, config) {
            var redirect = sessionStorage.getItem('profile_settings_redirect');
            if(redirect) {
                //TODO - send success message via cookie(or sca shared service)
                window.location = redirect;
            } else {
                toaster.success(data.message);
            }
        })
        .error(function(data, status, headers, config) {
            toaster.error(data.message);
        });         
    }
}]);

