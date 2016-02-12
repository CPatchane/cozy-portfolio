// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var stringBoolObject = cozydb.getModel('stringBoolObject', {
  "value": {type: String, "default": ""},
   "display": {type: Boolean, "default": false}
});

var userModel = cozydb.getModel('user', {
  "firstName" : stringBoolObject,
  "lastName" : stringBoolObject,
  "birthdayDate" : stringBoolObject,
  "email" : stringBoolObject,
  "description" : stringBoolObject,
  "status" : stringBoolObject,
  "localisation" : stringBoolObject,
  "resumes" : cozydb.NoSchema, //[{id, title, others..}]
  "activeResumeId" : {type: String, "default": ""},
	"hobbies" : stringBoolObject,
	"keywords" : stringBoolObject
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
