// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var userModel = cozydb.getModel('user', {
  "firstName" : String,
  "lastName" : String,
  "birthdayDate" : String,
  "email" : String,
  "description" : String,
  "position" : String,
  "localisation" : String,
  "resumes" : cozydb.NoSchema, //{id, title}
	"hobbies" : [String],
	"keywords" : [String] 
});

userModel.all = function(callback) {
  userModel.request("all", {}, function(err, user) {
    if (err) {
      callback(err);
    } else {
      callback(null, user);
    }
  });
};

module.exports = userModel;
