// See documentation on https://github.com/cozy/americano#routes

var badgesGroups = require('./badgesGroups');
var portfolioDocuments = require('./portfolioDocuments');
var userInfos = require('./userInfos');
var accountsInfos = require('./accountsInfos');
var init = require('./init');

module.exports = {
  //entry point of the client app in Cozy Cloud
  '': {
    get: init.start, //entry point
    put: accountsInfos.list //the "parametres" submit function bring automatically about a request PUT to /, so it's defined here but useless
  },
  //public page serving
  'public': {
    get: init.public
  },
  //get all user information -> profile/home view
  'getUserInfos': {
    get: userInfos.list
  },
  //update user information
  'updateUserInfos': {
    put: userInfos.update
  },
  //to get user information from DoYouBuzz
  'getDYBUserInfos': {
    post: userInfos.getFromDYB
  },
  //get accounts information -> parametres/accountSettings view
  'getAccountsInfos': {
    get: accountsInfos.list
  },
  //to update accounts information
  'updateAccountsInfos': {
    put: accountsInfos.update
  },
  //get link to connect a DoYouBuzz account (allow the user to give permission about getting data from DoYouBuzz)
  'getDYBConnection':{
    post: accountsInfos.getDYBConnection
  },
  //get all badges for the portfolio
  'getBadgesGroup': {
    get: badgesGroups.list
  },
  //to get all badges from OpenBadges Backpack
  'syncBadgesGroup': {
    get: badgesGroups.syncWithOB
  },
  //to update badges visibility preferences
  'updateBadgesVisibilities': {
    put: badgesGroups.updateBadgesVisibilities
  },
  //get all documents for the portfolio
  'getPortfolioDocuments': {
    get: portfolioDocuments.list
  },
  //to add a document thanks to the choices page form
  'addPortfolioDocument': {
    post: portfolioDocuments.add
  },
  //to delete a document
  'deletePortfolioDocument/:id': {
    get: portfolioDocuments.delete
  },
  //to update a document information
  'updatePortfolioDocument/:id': {
    put: portfolioDocuments.update
  },
  //to update documents visibility preferences
  'updateDocumentsVisibilities': {
    put: portfolioDocuments.updateVisibilities
  },
  //to get documents from DoYouBuzz
  'syncDYBDocuments': {
    get : portfolioDocuments.syncDYB
  }
};

