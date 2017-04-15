"use strict";

/*
 * Defined the Mongoose Schema and return a Model for a Photo
 */

/* jshint node: true */

var mongoose = require('mongoose');

/*
 * Photo can have comments and we stored them in the Photo object itself using
 * this Schema:
 */
var commentSchema = new mongoose.Schema({
    comment: String,     // The text of the comment.
    //visibility: String, // Boolean indicating whether a comment is visible publically or privately
    date_time: {type: Date, default: Date.now}, // The date and time when the comment was created.
    user_id: mongoose.Schema.Types.ObjectId,    // 	The user object of the user who created the comment.
});

// create a schema for Photo
var photoSchema = new mongoose.Schema({
    id: String,     // Unique ID identifying this user
    file_name: String, // 	Name of a file containing the actual photo (in the directory project6/images).
    //visibility: String, // Boolean indicating whether a photo is visible publically or privately
    likes: Number, // Number of likes a photo possesses
    user_likes: [String], // Users who liked a photo
    date_time: {type: Date, default: Date.now}, // 	The date and time when the photo was added to the database
    user_id: mongoose.Schema.Types.ObjectId, // The user object of the user who created the photo.
    comments: [commentSchema] // Comment objects representing the comments made on this photo.
});

// the schema is useless so far
// we need to create a model using it
var Photo = mongoose.model('Photo', photoSchema);

// make this available to our photos in our Node applications
module.exports = Photo;
