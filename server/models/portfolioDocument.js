// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var portfolioDocumentModel = cozydb.getModel('portfolioDocument', {
 	"title" : String,
	"url" : String,
	"relatedWebsite" : String,
	"description" : String,
	"creationDate" : String,
	"source" : String,
	"idSource" : Number,
	"type" : String
});

portfolioDocumentModel.all = function(callback) {
  portfolioDocumentModel.request("all", {}, function(err, portfolioDocument) {
    if (err) {
      callback(err);
    } else {
      callback(null, portfolioDocument);
    }
  });
};

module.exports = portfolioDocumentModel;
