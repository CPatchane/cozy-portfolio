// See documentation on https://github.com/cozy/americano#routes

var badgesGroups = require('./badgesGroups');
var portfolioDocuments = require('./portfolioDocuments');
var userInfos = require('./userInfos');
var accountsInfos = require('./accountsInfos');

module.exports = {
  '': {
    get: userInfos.list
  },
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
  'getDYBConnection':{
    post: accountsInfos.getDYBConnection
  },
  'getBadgesGroup': {
    get: badgesGroups.list
  },
  'addBadgesGroup': {
    post: badgesGroups.add
  },
  'deleteBadgesGroup/:id': {
    get: badgesGroups.delete
  },
  'updateBadgesGroup/:id': {
    put: badgesGroups.update
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
  }
  
};

