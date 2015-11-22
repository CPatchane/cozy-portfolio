// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

var portfolioModel = cozydb.getModel('portfolio', {
  title: String,
  date: Date,
  content: String
});

module.exports = portfolioModel;
