'use strict';

cs142App.controller('FavoritesController', ['$scope', '$rootScope', '$resource', '$mdDialog',
    function ($scope, $rootScope, $resource, $mdDialog) {
        $scope.main.title = 'Favorite Photos';

        var userId = $scope.main.currUser._id;
        //console.log('UserDetail of ', userId);

        var User = $resource('/user/' + userId, {}, {
          get: {method: 'get', isArray: false}
        });

        User.get({id: userId}, function(user) {
          //console.log('userList', userList);
          $scope.favorites = user.favorite_photos;
          console.log($scope.favorites);
        });

        $scope.delete = function(photo) {
          var favorite = $resource('/removeFavorites');
          favorite.save({photo: photo}, function(user) {
            $rootScope.$broadcast('updateFavorites');
            $rootScope.$broadcast('updatePhotos');
            console.log("Favorite photo deleted!");
            $scope.main.currUser = user;
          }, function errorHandling(err) {

          }); 
        };

        $rootScope.$on('updateFavorites', function () {
            User.get({id: userId}, function(user) {
              //console.log('userList', userList);
              $scope.favorites = user.favorite_photos;
              console.log($scope.favorites);
            });
        });

        $scope.showPhoto = function($event, photo) {
            console.log("Clicked photo!");
            var confirm = $mdDialog.confirm({
                ariaLabel: 'Photo',
                template: 
                    '<md-dialog>' + 
                    '   <md-dialog-content>' +
                    '       <img class="favorite-photo" ng-src="images/' + photo + '"></img><br>' +
                    '       <div class="caption">This is a caption!' +
                    '       </div>' +
                    '   </md-dialog-content>' +
                    //'   <md-dialog-actions>' +
                    //'       <md-button class="md-primary" ng-click="$mdDialog.hide()">Close</md-button>' +
                    //'   </md-dialog-actions>' +
                    '</md-dialog>',
                targetEvent: $event,
                clickOutsideToClose: true,
            });

            $mdDialog.show(confirm);
        };

        $scope.closeDialog = function() {
          // Easily hides most recent dialog shown...
          // no specific instance reference is needed.
          $mdDialog.hide();
        };

}]);

