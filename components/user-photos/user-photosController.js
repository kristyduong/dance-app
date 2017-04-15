'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$rootScope', '$routeParams', '$location', '$resource', '$route',
  function($scope, $rootScope, $routeParams, $location, $resource, $route) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
     var userId = $routeParams.userId;
     console.log('UserPhoto of ', $routeParams.userId);

     /*****/

     var UserList = $resource('/user/:id', {id: '@id'}, {
      get: {method: 'get', isArray: false}
    });

     UserList.get({id: userId}, function(userList) {
      //console.log('userList', userList);
      $scope.user = userList;
    });

    /*****/

     var PhotoListOfUser = $resource('/photosOfUser/:id', {id: '@id'}, {
      get: {method: 'get', isArray: true}
    });

    PhotoListOfUser.get({id: userId}, function(userPhotos) {
      //console.log('userPhotos', userPhotos);
      $scope.photos = userPhotos;
      if ($scope.main) {
        $scope.main.title = "Photos of " + $scope.user.first_name + " " + $scope.user.last_name;
      }
      for(var i = 0; i < userPhotos.length; i++) {
        userPhotos[i].liked = '';
        for(var j = 0; j < userPhotos[i].user_likes.length; j++) {
          if(userPhotos[i].user_likes[j] === $scope.main.currUser._id) {
            console.log("The photo is liked.");
            userPhotos[i].liked = userPhotos[i]._id;
          }
        }
        userPhotos[i].favorited = '';
        var user = $scope.main.currUser;
        console.log($scope.main.currUser);
        for(var k = 0; k < user.favorite_photos.length; k++) {
          if($scope.main.currUser.favorite_photos[k] === userPhotos[i].file_name) {
            userPhotos[i].favorited = userPhotos[i]._id;
          }
        }
      }

    });

    /*****/

    $rootScope.$on('updatePhotos', function() {
      PhotoListOfUser.get({id: userId}, function(userPhotos) {
        console.log('userPhotos', userPhotos);
        $scope.photos = userPhotos;

        for(var i = 0; i < userPhotos.length; i++) {
          userPhotos[i].favorited = '';
          var user = $scope.main.currUser;
          console.log($scope.main.currUser);
          for(var k = 0; k < user.favorite_photos.length; k++) {
            if($scope.main.currUser.favorite_photos[k] === userPhotos[i].file_name) {
              userPhotos[i].favorited = userPhotos[i]._id;
            }
          }
        }

      });
    });

    /*****/

    //$scope.liked = '';

    $scope.favoritePhoto = function(photo) {
      var favorite = $resource('/favorites');
      favorite.save({file_name: photo.file_name}, function(user) {
        console.log("Photo favorited!", photo.file_name);
        $scope.main.currUser = user;
        $rootScope.$broadcast('updatePhotos');
      }, function errorHandling(err) {

      });
    };

    $scope.likeComment = function(photo) {
      /*for(var i = 0; i < photo.user_likes.length; i++) {
        if(photo.user_likes[i] == $scope.main.currUser._id)
      }*/
      photo.liked = photo._id;
      photo.likes = photo.likes + 1;
      var like = $resource('/likePhoto/' + photo._id);
      like.save({likes: photo.likes}, function() {

      }, function errorHandling(err) {

      });
      //$scope.liked = photoId;
    };

    $scope.unlikeComment = function(photo) {
      photo.liked = '';
      photo.likes = photo.likes - 1;
      var unlike = $resource('/unlikePhoto/' + photo._id);
      unlike.save({likes: photo.likes, user: $scope.main.currUser._id}, function() {

      }, function errorHandling(err) {

      });
      //$scope.liked = '';
    };

    /*****/
     
    /*$scope.newComment = {
      comment: '',
    };*/

    $scope.addComment = function(photoId, comment) {
      var newComment = $resource('/commentsOfPhoto/' + photoId);
      newComment.save({comment: comment}, function(user) {
        //console.log($scope.newComment.comment);
        //console.log(photoId);
        console.log(user);
        //$route.reload();
        $rootScope.$broadcast('updatePhotos');
        $rootScope.$broadcast('updateActivity');

      }, function errorHandling(err) {

      });
    };
    
  }]);
