'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams', '$resource',
  function ($scope, $routeParams, $resource) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    console.log('UserDetail of ', userId);

    var UserList = $resource('/user/:id', {id: '@id'}, {
      get: {method: 'get', isArray: false}
    });

    UserList.get({id: userId}, function(userList) {
      //console.log('userList', userList);
      $scope.user = userList;
      if ($scope.main) {
        $scope.main.title = $scope.user.first_name + " " + $scope.user.last_name;
      }
    });

  }]);
