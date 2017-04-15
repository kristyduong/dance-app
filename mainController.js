'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial', 'ngResource', 'ngMessages']);

cs142App.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/login-register', {
                templateUrl: 'components/login-register/login-registerTemplate.html',
                controller: 'LoginRegisterController'
            }).
            when('/activities', {
                templateUrl: 'components/activity-feed/activity-feedTemplate.html',
                controller: 'ActivityFeedController'
            }).
            when('/users', {
                templateUrl: 'components/user-list/user-listTemplate.html',
                controller: 'UserListController'
            }).
            when('/users/:userId', {
                templateUrl: 'components/user-detail/user-detailTemplate.html',
                controller: 'UserDetailController'
            }).
            when('/photos/:userId', {
                templateUrl: 'components/user-photos/user-photosTemplate.html',
                controller: 'UserPhotosController'
            }).
            when('/favorites', {
                templateUrl: 'components/favorites/favoritesTemplate.html',
                controller: 'FavoritesController'
            }).
            when('/dance', {
                templateUrl: 'components/dance-collab/dance-collabTemplate.html',
                controller: 'DanceCollabController'
            }).
            otherwise({
                redirectTo: '/users'
            });
    }]);

cs142App.controller('MainController', ['$scope', '$rootScope', '$location', '$http', '$resource', '$route',
    function ($scope, $rootScope, $location, $http, $resource, $route) {
        $scope.main = {};
        $scope.main.title = 'Users';
        $scope.main.loggedIn = false;
        $scope.main.currUser = '';
        $scope.main.displayMessage = '';

        $rootScope.$on( "$routeChangeStart", function(event, next, current) {
          if (!$scope.main.loggedIn) {
             // no logged user, redirect to /login-register unless already there
            if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                $location.path("/login-register");
            }
          }
        });

        $scope.logOut = function(buttonName) {
            var loginInfo = $resource('/admin/logout');
            loginInfo.save({}, function() {
                $scope.main.loggedIn = false;
                $scope.main.currUser = '';
                $location.path("/login-register");
                $rootScope.$broadcast('updateActivity');
            }, function errorHandling(err) {
                
            });
        };

        var TestInfo = $resource('/test/info', {}, {
          get: {method: 'get', isArray: false}
        });

         TestInfo.get({}, function(text) {
          $scope.main.version = text;
        });

        /***************/

        var selectedPhotoFile;   // Holds the last file selected by the user

        // Called on file selection - we simply save a reference to the file in selectedPhotoFile
        $scope.inputFileNameChanged = function (element) {
            selectedPhotoFile = element.files[0];
        };

        // Has the user selected a file?
        $scope.inputFileNameSelected = function () {
            return !!selectedPhotoFile;
        };

        // Upload the photo file selected by the user using a post request to the URL /photos/new
        $scope.uploadPhoto = function () {
            if (!$scope.inputFileNameSelected()) {
                console.error("uploadPhoto called will no selected file");
                return;
            }
            console.log('fileSubmitted', selectedPhotoFile);

            // Create a DOM form and add the file to it under the name uploadedphoto
            var domForm = new FormData();
            domForm.append('uploadedphoto', selectedPhotoFile);

            // Using $http to POST the form
            $http.post('/photos/new', domForm, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).success(function(user){
                console.log(user);
                //$route.reload();
                $rootScope.$broadcast('updatePhotos');
                $rootScope.$broadcast('updateActivity');
                // The photo was successfully uploaded. XXX - Do whatever you want on success.
            }).error(function(err){
                // Couldn't upload the photo. XXX  - Do whatever you want on failure.
                console.error('ERROR uploading photo', err);
            });

        };

}]);