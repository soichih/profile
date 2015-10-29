
app.controller('SettingsController', ['$scope', 'appconf', '$route', 'toaster', '$http', 'jwtHelper',
function($scope, appconf, $route, toaster, $http, jwtHelper) {
    $scope.form_profile = {}; //to be loaded later
    $scope.user = null;
    $scope.appconf = appconf;

    var jwt = localStorage.getItem(appconf.jwt_id);
    var user = jwtHelper.decodeToken(jwt);

    $http.get(appconf.api+'/public/'+user.sub)
    .success(function(profile, status, headers, config) {
        $scope.form_profile = profile;
    })
    .error(function(data, status, headers, config) {
        if(data && data.message) {
            toaster.error(data.message);
        }
    }); 

    //load user info
    $http.get(appconf.auth_api+'/me')
    .success(function(info) {
        $scope.user = info;
    });
    
    //load menus (TODO - turn this into a service?)
    $http.get(appconf.shared_api+'/menu/top')
    .then(function(res) {
        $scope.top_menu = res.data;
    });
    $http.get(appconf.shared_api+'/menu/settings')
    .then(function(res) {
        $scope.settings_menu = res.data;
    });
    
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

