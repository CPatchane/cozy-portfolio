// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var accountsModel = cozydb.getModel('portfolioAccounts', {
    "openBadgesEmail" : {type: String, "default": ""},
    "openBadgesUserId" : {type: Number, "default": 0},
    "doYouBuzzAPIKey" : {type: String, "default": ""},
    "doYouBuzzAPISecret" : {type: String, "default": ""},
    "doYouBuzzOauthVerifierToken" : {type: String, "default": ""},
    "doYouBuzzOauthVerifierTokenSecret" : {type: String, "default": ""},
    "doYouBuzzOldTokenSecret" : {type: String, "default": ""}
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
