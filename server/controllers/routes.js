// See documentation on https://github.com/cozy/americano#routes

var badgesGroups = require('./badgesGroups');
var portfolioDocuments = require('./portfolioDocuments');
var userInfos = require('./userInfos');
var accountsInfos = require('./accountsInfos');
var init = require('./init');

module.exports = {
  '': {
    get: init.start
  },
  'public': {
    get: init.public
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
  'updateBadgesVisibilities': {
    put: badgesGroups.updateBadgesVisibilities
  },
  'getPortfolioDocuments': {
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
  'updateDocumentsVisibilities': {
    put: portfolioDocuments.updateVisibilities
  },
  'syncDYBDocuments': {
    get : portfolioDocuments.syncDYB
  }
};

