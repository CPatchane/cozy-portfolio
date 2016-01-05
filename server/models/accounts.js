// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var accountsModel = cozydb.getModel('accounts', {
    "id" : String,
    "openBadgesEmail" : String,
    "openBadgesUserId" : Number,
    "doYouBuzzAPIKey" : String,
    "doYouBuzzAPISecret" : String,
    "doYouBuzzOauthVerifierToken" : String,
    "doYouBuzzOauthVerifierTokenSecret" : String,
    "doYouBuzzOldTokenSecret" : String
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
