// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var portfolioDocumentModel = cozydb.getModel('portfolioDocument', {
	"id_document" : Number,
 	"title" : String,
	"url" : String,
	"relatedWebsite" : String,
	"description" : String,
	"creationDate" : String,
	"source" : String,
	"idSource" : Number, //id in source database, DoYouBuzz item id for example
	"category" : String
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
