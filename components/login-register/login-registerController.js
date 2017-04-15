'use strict';

cs142App.controller('LoginRegisterController', ['$scope', '$rootScope', '$location', '$resource', '$route',
    function ($scope, $rootScope, $location, $resource, $route) {

        $scope.userInfo = {
            login_name: '',
            password: '',
            verify: '',
            first_name: '',
            last_name: '',
            location: '',
            occupation: '',
            description: '',
        };

        var UserList = $resource('/user/list', {}, {
            get: {method: 'get', isArray: true}
        });

        UserList.get({}, function(userList) {
            console.log('userList', userList);
            $scope.users = userList;
        });

        $scope.submitForm = function(buttonName) {

            //if($scope.userForm.login_name.$invalid /*| $scope.userForm.password.$invalid*/) {
            //    console.log("Your username or password does not match our system.");
            //} else {

                var loginInfo = $resource('/admin/login');
                loginInfo.save({login_name: $scope.userInfo.login_name, password: $scope.userInfo.password}, function(user) {
                    //console.log('login', user);
                    $location.path("/users/" + user._id);
                    $scope.main.loggedIn = true;
                    $scope.main.currUser = user;
                    $rootScope.$broadcast('updateUsers');
                    $rootScope.$broadcast('updateActivity');
                }, function errorHandling(err) {
                    console.log("An error occurred: ", err);
                });
            //}
        };

        $scope.main.title = 'Please Login';

        $scope.buttonWasClicked = '';

        $scope.registerUser = function() {
            //if($scope.userForm.login_name.$invalid | $scope.userForm.first_name === '' | $scope.userForm.last_name === '') {
            //    console.log("Please correct your above errors before submitting.");
            //} else {
            if($scope.userInfo.password === $scope.userInfo.verify) {
                var registerInfo = $resource('/user');
                registerInfo.save({
                    login_name: $scope.userInfo.login_name, 
                    password: $scope.userInfo.password,
                    verify: $scope.userInfo.verify,
                    first_name: $scope.userInfo.first_name,
                    last_name: $scope.userInfo.last_name,
                    location: $scope.userInfo.location,
                    occupation: $scope.userInfo.occupation,
                    description: $scope.userInfo.description,
                }, function(user) {
                    console.log(user);
                    $rootScope.$broadcast('updateActivity');
                    //$location.path("/login-register");
                    //$route.reload();

                }, function errorHandling(err) {
                    console.log("An error occurred: ", err);
                });
            } else {
                console.log("Your password fields do not match.");
            }
        };

        $scope.buttonClick = function(buttonName) {
            if(buttonName === "register") {
                $scope.main.title = 'Register';
                $scope.buttonWasClicked = buttonName;
            }
            if(buttonName === "login") {
                $scope.main.title = 'Please Login';
                $scope.buttonWasClicked = '';
            }
        };
/*
        $scope.userExists = false;

        $scope.isUser = function(form) {
            //form.login_name.$error.userExists = false;
            //console.log($scope.login_name);

            for(var i = 0; i < $scope.users.length; i++) {
                var user = $scope.users[i];
                var UserList = $resource('/user/:id', {id: '@id'}, {
                  get: {method: 'get', isArray: false}
                });
                UserList.get({id: user._id}, function(userDetail) {
                    user = userDetail;
                    if(user.login_name === $scope.login_name) {
                        console.log("You got here.");
                        $scope.userExists = true;
                    }
                });
            }
        };*/

}]);

