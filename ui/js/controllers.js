
app.controller('HeaderController', function($scope, appconf, menu) {
    $scope.appconf = appconf;
    $scope.menu = menu;
});

app.controller('SettingsController', 
function($scope, $route, toaster, $http, scaMessage, scaSettingsMenu, jwtHelper) {
    scaMessage.show(toaster);
    $scope.settings_menu = scaSettingsMenu;

    var jwt = localStorage.getItem($scope.appconf.jwt_id);
    $scope.user = jwtHelper.decodeToken(jwt);
    
    //load public profile
    $http.get($scope.appconf.api+'/public/'+$scope.menu.user.sub).then(function(res) {
        $scope.form_profile = res.data;
    }, function(res) {
        if(res.data && res.data.message) toaster.error(res.data.message);
        else toaster.error(res.statusText);
    });

    /*
    //load institutions used by other users
    $http.get($scope.appconf.api).then(function(res) {
        $scope.institutions = res.data.profiles.map(p=>{
            return p.public.institutions;
        });
        $scope.institutions.push("Indiana University");
    }, function(res) {
        if(res.data && res.data.message) toaster.error(res.data.message);
        else toaster.error(res.statusText);
    });
    */

    $scope.submit_profile = function() {
        $http.put($scope.appconf.api+'/public/'+$scope.menu.user.sub, $scope.form_profile)
        .then(function(res) {
            var redirect = sessionStorage.getItem('profile_settings_redirect');
            if(redirect) {
                scaMessage.success(res.data.message);
                window.location = redirect;
            } else {
                toaster.success(res.data.message);
                $scope.profile_form.$setPristine();
            }
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });         
    }
});

