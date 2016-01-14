// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var badgeModel = cozydb.getModel('badge', {
  "lastValidated": String,
  "hostedUrl": String,
  "name": String,
  "description": String,
  "imageUrl": String,
  "criteria": String,
  "issuerName": String,
  "issuerUrl": String,
  "issuedOn": String,
  "visible":Boolean
});

var badgeGroupModel = cozydb.getModel('badgeGroup', {
	"id" : Number,
	"groupId" : Number,
	"name" : String,
	"totalBadges" : Number,
	"badges" : [badgeModel]
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
