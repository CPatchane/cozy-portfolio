// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var accountsModel = cozydb.getModel('accounts', {
  "openBadges" : {
		"email" : String,
		"userId" : Number
	},
	"doYouBuzz" : {
		"API key" : String,
		"oauthVerifierToken" : String
	}
});

module.exports = accountsModel;
