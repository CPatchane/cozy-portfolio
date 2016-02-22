// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var portfolioDocumentModel = cozydb.getModel('portfolioDocument', {
 	"title" : {type: String, "default": ""},
	"url" : {type: String, "default": ""},
	"relatedWebsite" : {type: String, "default": ""},
	"description" : {type: String, "default": ""},
	"creationDate" : {type: String, "default": ""},
	"source" : {type: String, "default": ""},
	"idSource" : {type: Number, "default": 0}, //id in source database, DoYouBuzz item id for example
	"category" : {type: String, "default": ""},
  "visibility" : {type: Boolean, "default": false}
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
