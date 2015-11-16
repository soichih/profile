
app.controller('HeaderController', ['$scope', 'appconf', 'menuservice', function($scope, appconf, menuservice) {
    $scope.title = appconf.title;
    menuservice.then(function(_menu) { $scope.menu = _menu; });
}]);

app.controller('SettingsController', ['$scope', 'appconf', '$route', 'toaster', '$http', 'scaMessage', 'scaSettingsMenu', 'menuservice',
function($scope, appconf, $route, toaster, $http, scaMessage, scaSettingsMenu, menuservice) {
    $scope.appconf = appconf;
    scaMessage.show(toaster);
    $scope.settings_menu = scaSettingsMenu;
    menuservice.then(function(_menu) { 
        //$scope.menu = _menu; //already set by header controller
        $scope.form_profile = _menu._profile;
    });

    $scope.submit_profile = function() {
        $http.put(appconf.api+'/public/'+$scope.menu.user.sub, $scope.form_profile)
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

