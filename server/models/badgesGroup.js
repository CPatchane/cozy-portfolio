// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var badgeModel = cozydb.getModel('badge', {
  "lastValidated": {type: String, "default": ""},
  "hostedUrl": {type: String, "default": ""},
  "name": {type: String, "default": ""},
  "description": {type: String, "default": ""},
  "imageUrl": {type: String, "default": ""},
  "criteria": {type: String, "default": ""},
  "issuerName": {type: String, "default": ""},
  "issuerUrl": {type: String, "default": ""},
  "issuedOn": {type: String, "default": ""},
  "visible": {type: Boolean, "default": false}
});

var badgeGroupModel = cozydb.getModel('badgeGroup', {
	"id" : Number,
	"groupId" : {type: Number, "default": 0},
	"name" : {type: String, "default": ""},
	"totalBadges" : {type: Number, "default": 0},
	"badges" : {type: [badgeModel], "default": []}
});

badgeGroupModel.all = function(callback) {
  badgeGroupModel.request("all", {}, function(err, badgeGroup) {
    if (err) {
      callback(err);
    } else {
      callback(null, badgeGroup);
    }
  });
};

module.exports  = badgeGroupModel;
