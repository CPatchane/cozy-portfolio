// See documentation on https://github.com/cozy/americano#routes

var badgesGroups = require('./badgesGroups');
var portfolioDocuments = require('./portfolioDocuments');

module.exports = {
  'getBadgesGroup': {
    get: badgesGroups.list
  },
  'addBadgesGroup': {
    post: portfolioDocuments.add
  },
  'deleteBadgesGroup': {
    get: portfolioDocuments.delete
  },
  'getPortfolioDocument': {
    get: portfolioDocuments.list
  },
  'addPortfolioDocument': {
    post: portfolioDocuments.add
  },
  'deletePortfolioDocument': {
    get: portfolioDocuments.delete
  }
};

