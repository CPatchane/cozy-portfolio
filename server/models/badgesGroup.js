// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var badgeGroupModel = cozydb.getModel('badgeGroup', {
	"groupId" : Number,
	"name" : String,
	"totalBadges" : Number,
	"badges" : [
		{
			"lastValidated": String,
			"hostedUrl": String,
			"assertion": {
				"uid": String,
				"recipient": String,
				"badge": {
					"name": String,
					"description": String,
					"image": String,
					"criteria": String,
					"issuer": {
						"name": String,
						"url": String,
						"_location": String,
						"origin": String
					},
					"_location": String
				},
				"verify": {
					"url": String,
					"type": String
				},
				"issuedOn": Number,
				"_originalRecipient": {
					"identity": String,
					"type": String,
					"hashed": Boolean
				},
				"issued_on": Number
			},
			"imageUrl": String
		}
	]
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
