'use strict';

cs142App.controller('UserListController', ['$scope', '$rootScope','$resource',
    function ($scope, $rootScope, $resource) {
        $scope.main.title = 'Users';

        /*var UserList = $resource('/user/list', {}, {
            get: {method: 'get', isArray: true}
        });

        UserList.get({}, function(userList) {
            //console.log('userList', userList);
            $scope.users = userList;
        });*/

        $rootScope.$on('updateUsers', function () {
            var UserList = $resource('/user/list', {}, {
                get: {method: 'get', isArray: true}
            });

            UserList.get({}, function(userList) {
                //console.log('userList', userList);
                $scope.users = userList;
            });
        });

        $rootScope.$on('updateActivity', function () {
            var ActivityList = $resource('/activities', {}, {
                get: {method: 'get', isArray: true}
            });

            ActivityList.get({}, function(activityList) {
                console.log(activityList);
                for(var i = 0; i < activityList.length; i++) {
                    console.log(activityList[i]);
                    if(activityList[i].user_id === $scope.main.currUser._id) {
                        $scope.activity = activityList[i];
                        console.log("It's a match!");
                        break;
                    }
                }
                //console.log('userList', userList);
            });
        });

}]);

