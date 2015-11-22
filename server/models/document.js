// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var documentModel = cozydb.getModel('document', {
 	"title" : String,
	"url" : String,
	"relatedWebsite" : String,
	"description" : String,
	"creationDate" : String,
	"source" : String,
	"idSource" : Number,
	"type" : String
});

module.exports = documentModel;
