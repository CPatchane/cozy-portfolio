// See documentation on https://github.com/cozy/americano#routes

var badgesGroups = require('./badgesGroups');
var portfolioDocuments = require('./portfolioDocuments');
var userInfos = require('./userInfos');
var accountsInfos = require('./accountsInfos');

module.exports = {
  '': {
    get: userInfos.start
  },
  'getUserInfos': {
    get: userInfos.list
  },
  'updateUserInfos': {
    put: userInfos.update
  },
  'getDYBUserInfos': {
    post: userInfos.getFromDYB
  },
  'getAccountsInfos': {
    get: accountsInfos.list
  },
  'updateAccountsInfos': {
    put: accountsInfos.update
  },
  'getDYBConnection':{
    post: accountsInfos.getDYBConnection
  },
  'getBadgesGroup': {
    get: badgesGroups.list
  },
  /*'deleteBadgesGroups': {
    get: badgesGroups.destroy
  },*/
  'syncBadgesGroup': {
    get: badgesGroups.syncWithOB
  },
  'updateBadgesGroup': {
    put: badgesGroups.updateBadges
  },
  'getPortfolioDocument': {
    get: portfolioDocuments.list
  },
  'addPortfolioDocument': {
    post: portfolioDocuments.add
  },
  'deletePortfolioDocument/:id': {
    get: portfolioDocuments.delete
  },
  'updatePortfolioDocument/:id': {
    put: portfolioDocuments.update
  },
  'syncDYBDocuments': {
    get : portfolioDocuments.syncDYB
  }
};

