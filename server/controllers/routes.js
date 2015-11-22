// See documentation on https://github.com/cozy/americano#routes

var badgesGroups = require('./badgesGroups');
var portfolioDocuments = require('./portfolioDocuments');
var userInfos = require('./userInfos');
var accountsInfos = require('./accountsInfos');

module.exports = {
  'getUserInfos': {
    get: userInfos.list
  },
  'updateUserInfos': {
    put: userInfos.update
  },
  'getAccountsInfos': {
    get: accountsInfos.list
  },
  'updateAccountsInfos': {
    put: accountsInfos.update
  },
  'getBadgesGroup': {
    get: badgesGroups.list
  },
  'addBadgesGroup': {
    post: badgesGroups.add
  },
  'deleteBadgesGroup': {
    get: badgesGroups.delete
  },
  'updateBadgesGroup': {
    put: badgesGroups.update
  },
  'getPortfolioDocument': {
    get: portfolioDocuments.list
  },
  'addPortfolioDocument': {
    post: portfolioDocuments.add
  },
  'deletePortfolioDocument': {
    get: portfolioDocuments.delete
  },
  'updatePortfolioDocument': {
    put: portfolioDocuments.update
  }
  
};

