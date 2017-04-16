"use strict";

var fs = require("fs");
var mongoose = require('mongoose');
var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');
var Activity = require('./schema/activity.js');

var express = require('express');
var app = express();

var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

mongoose.connect('mongodb://localhost/cs142project6');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

app.post('/removeFavorites', function(request, response) {

    var id = request.session.user_id;

    var query = User.findOne({_id: id});

    if (id !== null) {
        query.select("_id first_name last_name favorite_photos").exec(function (err, user) {
        //User.findOne({_id: id}, function (err, user) {
            if(!user) {
                console.error("This is not a valid user.");
                response.status(400).send("This is not a valid user.");
                return;
            }
            if (err) {
                console.error('An error occurred:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            for(var i = 0; i < user.favorite_photos.length; i++) {
                if(user.favorite_photos[i] === request.body.photo) {
                    user.favorite_photos.splice(i, 1);
                }
            }
            user.save();
            //console.log(user.favorite_photos);
            response.end(JSON.stringify(user));
        });
    } else {
        response.status(400).send('Bad param');
    }
});

app.post('/favorites', function(request, response) {
    var id = request.session.user_id;

    var query = User.findOne({_id: id});

    if (id !== null) {
        query.select("_id first_name last_name favorite_photos").exec(function (err, user) {
        //User.findOne({_id: id}, function (err, user) {
            if(!user) {
                console.error("This is not a valid user.");
                response.status(400).send("This is not a valid user.");
                return;
            }
            if (err) {
                console.error('An error occurred:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            //var newFavorite = {
            //    file_name: request.body.photo.file_name,
            //    date_time: request.body.photo.date_time
            //};
            user.favorite_photos.push(request.body.file_name);
            user.save();
            //console.log(user.favorite_photos);
            response.end(JSON.stringify(user));
        });
    } else {
        response.status(400).send('Bad param');
    }
});

app.post('/likePhoto/:photo_id', function(request, response) {
    var photo_id = request.params.photo_id;

    var query = Photo.findOne({_id: photo_id});

    query.select("_id user_id file_name date_time likes user_likes").exec(function (err, photo) {
        if (err) {
            console.error('Error: ', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        console.log(photo);
        photo.likes = request.body.likes;
        photo.user_likes.push(request.session.user_id);
        console.log(photo.user_likes);
        photo.save();
        response.end();
    });

});

app.post('/unlikePhoto/:photo_id', function(request, response) {
    var photo_id = request.params.photo_id;

    var query = Photo.findOne({_id: photo_id});

    query.select("_id user_id file_name date_time likes user_likes").exec(function (err, photo) {
        if (err) {
            console.error('Error: ', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        photo.likes = request.body.likes;
        for(var i = 0; i < photo.user_likes.length; i++) {
            if(photo.user_likes[i] === request.session.user_id) {
                photo.user_likes.splice(i, 1);
            }
        }
        console.log(photo.user_likes);
        photo.save();
        response.end();
    });

});

app.post('/commentsOfPhoto/:photo_id', function(request, response) {

    if(!request.body.comment) {
        response.status(400).send('No comment');
        return;
    }

    var photo_id = request.params.photo_id;
    console.log(photo_id);

    var query = Photo.findOne({_id: photo_id});

    query.select("_id user_id comments file_name date_time").exec(function (err, photo) {
        if (err) {
            console.error('Error: ', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        User.findOne({_id: request.session.user_id}, function (err, user) {
            Activity.create({date_time: new Date(), 
            user_id: request.session.user_id,
            first_name: user.first_name, 
            last_name: user.last_name,
            type: "Added Comment",
            file_name: photo.file_name}, secondDoneCallback);

            function secondDoneCallback(err, newActivity) {
                var newComment = {
                    comment: request.body.comment,
                    date_time: new Date(),
                    user_id: request.session.user_id,
                };
                //console.log(newComment);
                photo.comments.push(newComment);
                console.log(photo.comments);
                photo.save();
                response.end(JSON.stringify(photo.user_id));
            }
        });  
    });

});

app.post('/photos/new', function(request, response) {
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            // XXX -  Insert error handling code here.
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes

        // XXX - Do some validation here.
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + request.file.originalname;

        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
            Photo.create({date_time: timestamp, 
                file_name: filename,
                likes: 0,
                user_id: request.session.user_id}, doneCallback);

            function doneCallback(err, newPhoto) {
                User.findOne({_id: request.session.user_id}, function (err, user) {
                    Activity.create({date_time: new Date(), 
                    user_id: request.session.user_id,
                    first_name: user.first_name, 
                    last_name: user.last_name,
                    type: "Added Photo",
                    file_name: filename}, secondDoneCallback);

                    function secondDoneCallback(err, newActivity) {
                        console.log('Created object with ID', newPhoto._id);
                        response.end(JSON.stringify(request.session.user_id));
                    }
                });  
               //console.log('Created object with ID', newPhoto._id);
               //response.end(JSON.stringify(request.session.user_id));
            }
          // XXX - Once you have the file written into your images directory under the name
          // filename you can create the Photo object in the database
        });
    });
});

app.post('/user', function(request, response) {
    var query = User.findOne({login_name: request.body.login_name});

    if (request.body.login_name !== null) {
        query.select("_id first_name last_name location description occupation login_name password").exec(function (err, user) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if(user) {
                console.error("This username is already taken.");
                response.status(400).send("This username is already taken.");
                return;
            }
            if(!request.body.login_name | !request.body.password | !request.body.first_name | !request.body.last_name) {
                console.error("You are missing a required field.");
                response.status(400).send("You are missing a required field");
                return;
            }
            /*if(request.body.password !== request.body.verify) {
                console.error("Your password fields do not match.");
                response.status(400).send("Your password fields do not match.");
                return;
            }*/

            //console.log(request.body);
            User.create({login_name: request.body.login_name, 
                password: request.body.password, 
                first_name: request.body.first_name, 
                last_name: request.body.last_name, 
                location: request.body.location, 
                occupation: request.body.occupation, 
                description: request.body.description}, doneCallback);

            function doneCallback(err, newUser) {
                Activity.create({date_time: new Date(), 
                user_id: newUser._id,
                first_name: newUser.first_name, 
                last_name: newUser.last_name,
                type: "Registered"}, secondDoneCallback);

                function secondDoneCallback(err, newActivity) {
                    response.status(200).send(JSON.stringify(newUser));
                    console.log('New user created!');
                    response.end();
                }
            }
            
        });
    } else {
        response.status(400).send("Invalid registration.");
    }
});

app.post('/admin/login', function(request, response) {
    console.log(request.body);

    var query = User.findOne({login_name: request.body.login_name});

    if (request.body.login_name !== null) {
        query.select("_id first_name last_name location description occupation login_name password favorite_photos").exec(function (err, user) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if(!user) {
                console.error("This is not a valid user.");
                response.status(400).send("This is not a valid user.");
                return;
            }
            if(user.password !== request.body.password) {
                console.error("This password is incorrect.");
                response.status(400).send("Your password is incorrect.");
                return;
            }
            request.session.login_name = user.login_name;
            request.session.user_id = user._id;

            Activity.create({date_time: new Date(), 
                user_id: request.session.user_id,
                first_name: user.first_name, 
                last_name: user.last_name,
                type: "Logged In"}, doneCallback);

            function doneCallback(err, newActivity) {
                console.log("New activity created!");
                console.log(request.body);
                response.end(JSON.stringify(user));
            }
        });
    } else {
        response.status(400).send("Invalid login.");
    }
});

app.post('/admin/logout', function(request, response) {
    User.findOne({_id: request.session.user_id}, function (err, user) {
        Activity.create({date_time: new Date(), 
        user_id: request.session.user_id,
        first_name: user.first_name, 
        last_name: user.last_name,
        type: "Logged Out"}, doneCallback);

        function doneCallback(err, newActivity) {
            delete request.session.login_name;
            delete request.session.user_id;
            request.session.destroy(function(err) {
                if(err) {
                    response.status(200).send("Error");
                }
            });
            console.log("deleted", request.session);
            response.end();
        }
    });
});


/*
 * URL /activity-feed - Return all the Activity object.
 */
 app.get('/activities', function(request, response) {

    if(!request.session.login_name) {
        console.error('Unauthorized access to user list');
        response.status(401).send('Unauthorized access to user list');
        return;
    }
    
    Activity.find({}, function (err, activityList) {
        response.end(JSON.stringify(activityList));   
    }).sort({date_time: -1}).limit(20);

 });

/*
 * URL /user/list - Return all the User object.
 */
/*app.get('/user/list', function (request, response) {

    var query = User.find({});

    query.select("_id first_name last_name").exec(function (err, list) {
            if (err) {
                console.error('Error: ', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            //console.log('User', list);
            response.end(JSON.stringify(list));
        });

});*/

/*
 * URL /user/:id - Return the information for User (id)
 */
/*app.get('/user/:id', function (request, response) {

    if(!request.session.login_name) {
        response.status(401).send('Unauthorized access');
        return;
    }

    var id = request.params.id;

    var query = User.findOne({_id: id});

    if (id !== null) {
        query.select("_id first_name last_name location description occupation favorite_photos").exec(function (err, user) {
        //User.findOne({_id: id}, function (err, user) {
            if(!user) {
                console.error("This is not a valid user.");
                response.status(400).send("This is not a valid user.");
                return;
            }
            if (err) {
                console.error('Doing /user/:id error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            //console.log('User', user);
            response.end(JSON.stringify(user));
        });
    } else {
        response.status(400).send('Bad param');
    }

});*/

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {

    if(!request.session.user_id) {
        console.error('Unauthorized access to photos');
        response.status(401).send('Unauthorized access to photos');
        return;
    }

    var id = request.params.id;

    var query = Photo.find({user_id: id}).sort({likes: -1, date_time: -1});

    query.select("_id user_id likes user_likes comments file_name date_time").exec(function (err, userPhotos) {

        //query.sort("likes").exec(function(err, userPhotos) {
    
    //Photo.find({user_id: id}, function(err, userPhotos) {

        /*if (userPhotos === undefined | userPhotos.length === 0) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }*/

        if(!mongoose.Types.ObjectId.isValid(id)) {
            response.status(400).send('Invalid object');
            return;
        }

        if (err) {
            console.error('Error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }

        userPhotos = JSON.parse(JSON.stringify(userPhotos));

        async.each(userPhotos, function(photo, callback) {
            async.each(photo.comments, function(comment, othercallback) {
                var users = User.findOne({_id: comment.user_id});

                users.select("_id first_name last_name").exec(function (err, user) {
                    if (err) {
                        console.error('Error:', err);
                        response.status(500).send(JSON.stringify(err));
                        return;
                    }

                    delete comment.user_id;
                    comment.user = user;
                    //console.log('User', comment);
                    othercallback();
                });

            }, function(err) {
                if(err) {
                    response.status(500).send(JSON.stringify(err));
                }
                callback();
            });
            //console.log(photo.comments);
        }, function(err) {
            if(err) {
                response.status(500).send(JSON.stringify(err));
            }
            response.end(JSON.stringify(userPhotos));
        });
        //console.log(userPhotos);
        
        //}); //end of sort

    });
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});

