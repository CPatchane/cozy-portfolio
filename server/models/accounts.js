// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var accountsModel = cozydb.getModel('accounts', {
  "openBadges" : {
		"email" : String,
		"userId" : Number
	},
	"doYouBuzz" : {
		"API key" : String,
        "API Secret" : String,
		"oauthVerifierToken" : String,
        "oauthVerifierTokenSecret": String
	}
});

accountsModel.all = function(callback) {
  accountsModel.request("all", {}, function(err, accounts) {
    if (err) {
      callback(err);
    } else {
      callback(null, accounts);
    }
  });
};

module.exports = accountsModel;
