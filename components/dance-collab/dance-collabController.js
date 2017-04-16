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

        $scope.main.cellClass = "unselected"
        $scope.main.selectCells = function(){
            console.log("ok");
            $scope.main.cellClass = "selected"
        }

        $scope.main.startDrag = function(event){
            console.log("x", event.x);
            console.log("y", event.y);
        }

        $scope.main.endDrag = function(event){
            console.log("end x", event.pageX);
            console.log("end y", event.pageY);
        }

}]);

