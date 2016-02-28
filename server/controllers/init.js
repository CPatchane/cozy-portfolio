//this controller is used only to start the cozycloud application and serve the public view of the portfolio
var portfolioDocument = require('../models/portfolioDocument');
var badgesGroup = require('../models/badgesGroup');
var user = require('../models/user');

//first entry of the client application
module.exports.start = function(req, res, next){
  //it will render all the client application pages into the client/index.jade
  res.render('index.jade', {}, function(err, html) {
    res.send(html);
  });
}

//public entry to the portfolio public view
module.exports.public = function(req, res, next){
  var portfolio = {}; //all information about the portfolio with the permission to be visible will be stored here before be sent to the public page
  user.all(function(err, userInfos) { //we get all user information
    if(err !== null) {
      res.status(404).send("");
      return;
    }
    else if(userInfos == null || userInfos.length == 0){//no user infos registered, we skip to the next step
      getBadges();
    }
    else {
      userInfos = userInfos[0];
      var userData = {};
      //user name
      if(userInfos.firstName.visibility || userInfos.lastName.visibility){
        userData.name = "";
        if(userInfos.firstName.visibility) userData.name += userInfos.firstName.value;
        if(userInfos.lastName.visibility) 
        {
          if(userInfos.firstName.visibility) userData.name += " ";
          userData.name += userInfos.lastName.value;
        }
      }
      //age
      if(userInfos.birthdayDate.visibility){
        var today = new Date();
        //we need to transform the date format from JJ/MM/AAAA to AAAA-MM-JJ to compute the age
        var datePattern = /(\d{2})[/.-](\d{2})[/.-](\d{4})/;
        var birthDate = new Date(userInfos.birthdayDate.value.replace(datePattern,'$3-$2-$1'));
        //and compute the age
        var age = today.getFullYear() - birthDate.getFullYear();
        var months = today.getMonth() - birthDate.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        userData.age = age;
      }
      //description
      if(userInfos.email.visibility){
        userData.email = userInfos.email.value;
      }
      //email
      if(userInfos.description.visibility){
        userData.description = userInfos.description.value;
      }
      //statut
      if(userInfos.status.visibility){
        userData.status = userInfos.status.value;
      }
      //localisation
      if(userInfos.localisation.visibility){
        userData.localisation = userInfos.localisation.value;
      }
      //hobbies
      if(userInfos.hobbies.visibility){
        //we have to get all separated words from the string
        var hobbies = userInfos.hobbies.value.split(",");
        hobbies.forEach(function(hobby, index, array){
          hobby = hobby.replace( /\s\s+/g, ' ' ); //replace all duplicated spaces by only one space
          hobby = hobby.trim(); //remove whitespaces from both sides of the string
          hobby = hobby.charAt(0).toUpperCase() + hobby.slice(1); //we transform the first letter to upper case
          hobbies[index] = hobby;
        });
        userData.hobbies = hobbies;
      }
      //keywords
      if(userInfos.keywords.visibility){
        //we have to get all separated words from the string
        var keywords = userInfos.keywords.value.split(",");
        keywords.forEach(function(keyword, index, array){
          keyword = keyword.replace( /\s\s+/g, ' ' ); //replace all duplicated spaces by only one space
          keyword = keyword.trim(); //remove whitespaces from both sides of the string
          keyword = keyword.charAt(0).toUpperCase() + keyword.slice(1); //we transform the first letter to upper case
          keywords[index] = keyword;
        });
        userData.keywords = keywords;
      }
      if(Object.keys(userData).length) portfolio.user = userData;
      //after we request badges
      getBadges();
    }
  });
  
  //function to get badges from database according to the visibily preferences
  function getBadges(){
    badgesGroup.all(function(err, badgesGroups) {
      if(err !== null) {
        res.status(404).send("");
        return;
      }
      else if(badgesGroups == null || badgesGroups.length == 0){//no badges groups stored, we skip to the next step
        getDocuments();
      }
      else {
        var badge = {}; //object to store all badges before adding them to the portfolio object 
        badgesGroups.forEach(function(group, group_index, array){ //in all badges group
          group.badges.forEach(function(badgeData, badge_index, array){ //we check each badges
            if(badgeData.visibility){ //if it's marked as visible by the user
              if(!portfolio.badges) portfolio.badges = []; //for the first badges, portfolio.badges is not created yet
              badge = { //we get all information about this badge
                name : badgeData.name,
                issuerName : badgeData.issuerName,
                hostedUrl : badgeData.hostedUrl,
                description: badgeData.description,
                imageUrl: badgeData.imageUrl,
                isserUrl: badgeData.issuerUrl,
                issuedOn: badgeData.issuedOn
              }
              portfolio.badges.push(badge); // and add it to the portfolio object
            }
          });
        });
        //after that we request all portfolio documents
        getDocuments();
      }
    });
  }
  
  //function to get all portfolio documents from the database and according to the visibility preferences
  function getDocuments(){
    portfolioDocument.all(function(err, documents) {
      if(err !== null) {
        res.status(404).send("");
        return;
      }
      if(documents == null || documents.length == 0){//no documents stored in the database, we check the portfolio to render the correct page
        //if the portfolio object is empty, there is not portfolio to show, we send a 404 code page
        if(!Object.keys(portfolio).length){
          res.status(404).send("404 Not found");
          return;
        }
        //in all other cases, we build the html structure of the public portfolio page
        res.render('public.jade', portfolio, function(err, html) {
          res.status(200).send(html);
          return;
        });
      }
      else {
        var document = {}; //object to store all documents before adding them to the portfolio object 
        documents.forEach(function(documentData, index, array){ //for each portfolio document
          if(documentData.visibility){ //if it's marked as visible by the user
            if(!portfolio.portfolios) portfolio.portfolios = {}; //for the first document, portfolio.portfolios is not created yet
            if(!portfolio.portfolios[documentData.category]){ //for each new document category
              portfolio.portfolios[documentData.category] = { //we get all information about this category and add an empty array for its documents
                "title": documentData.category,
                "documents": []
              };
            }
            //we get all document information
            document = {
              "title": documentData.title,
              "description": documentData.description,
              "url": documentData.url,
              "relatedWebsite": documentData.relatedWebsite,
              "creationDate": documentData.creationDate
            }
            //add add the document to the matching category in portfolios
            portfolio.portfolios[documentData.category].documents.push(document);
          }
        });
        //if the object returned is empty, there is not portfolio to show, we send a 404 code page
        if(!Object.keys(portfolio).length){
          res.status(404).send("404 Not found");
          return;
        }
        //in all other cases, we build the html structure of the public portfolio page
        res.render('public.jade', portfolio, function(err, html) {
          res.status(200).send(html);
          return;
        });
      }
    });
  }
}