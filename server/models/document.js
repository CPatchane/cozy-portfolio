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

module.exports = portfolioDocumentModel;
