
app.controller('HeaderController', ['$scope', 'appconf', 'menu', function($scope, appconf, menu) {
    $scope.title = appconf.title;
    $scope.menu = menu;
}]);

app.controller('SettingsController', ['$scope', 'appconf', '$route', 'toaster', '$http', 'scaMessage', 'scaSettingsMenu', 'jwtHelper',
function($scope, appconf, $route, toaster, $http, scaMessage, scaSettingsMenu, jwtHelper) {
    $scope.appconf = appconf;
    scaMessage.show(toaster);
    $scope.settings_menu = scaSettingsMenu;

    var jwt = localStorage.getItem(appconf.jwt_id);
    $scope.user = jwtHelper.decodeToken(jwt);
    
    //load public profile
    $http.get(appconf.api+'/public/'+$scope.menu.user.sub).then(function(res) {
        $scope.form_profile = res.data;
    }, function(res) {
        if(res.data && res.data.message) toaster.error(res.data.message);
        else toaster.error(res.statusText);
    });

    $scope.submit_profile = function() {
        $http.put(appconf.api+'/public/'+$scope.menu.user.sub, $scope.form_profile)
        .then(function(res) {
            var redirect = sessionStorage.getItem('profile_settings_redirect');
            if(redirect) {
                //TODO - send success message via cookie(or sca shared service)
                window.location = redirect;
            } else {
                toaster.success(res.data.message);
            }
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });         
    }
}]);

