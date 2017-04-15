"use strict";

/*
 * Defined the Mongoose Schema and return a Model for an Activity
 */

var mongoose = require('mongoose');

// create a schema for Activity
var activitySchema = new mongoose.Schema({
	date_time: Date,
	user_id: String,
	first_name: String,
	last_name: String,
	type: String,
	file_name: String
});

// the schema is useless so far
// we need to create a model using it
var Activity = mongoose.model('Activity', activitySchema);

// make this available to our photos in our Node applications
module.exports = Activity;