// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var userModel = cozydb.getModel('user', {
  "user": {
		"firstName" : String,
		"lastName" : String,
		"age" : Number,
		"email" : String,
		"links" : {
			"websiteFR" : String,
			"websiteEN" : String
		},
		"description" : String,
		"position" : String,
		"headline" : String,
		"localisation" : String
	},
	
	"hobbies" : [String],
	
	"keywords" : [String] 
});

module.exports = userModel;
