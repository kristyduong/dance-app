'use strict';

cs142App.controller('DanceCollabController', ['$scope', '$rootScope','$resource',
    function ($scope, $rootScope, $resource) {

        $scope.main.title = 'Activities';

        var ActivityList = $resource('/activities', {}, {
            get: {method: 'get', isArray: true}
        });

        ActivityList.get({}, function(activityList) {
            console.log(activityList);
            //console.log('userList', userList);
            $scope.activities = activityList;
        });

        $rootScope.$on('updateActivity', function () {
            ActivityList.get({}, function(activityList) {
                console.log(activityList);
                //console.log('userList', userList);
                $scope.activities = activityList;
            });
        });
        /*$rootScope.$on('updateUsers', function () {
            UserList.get({}, function(userList) {
                //console.log('userList', userList);
                $scope.users = userList;
            });
        });*/

}]);

