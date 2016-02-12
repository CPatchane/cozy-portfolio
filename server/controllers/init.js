//this controller is used only to start the cozycloud application and serve the public view of the portfolio
var portfolioDocument = require('../models/portfolioDocument');
var badgesGroup = require('../models/badgesGroup');
var user = require('../models/user');

//first entry of the client application
module.exports.start = function(req, res, next){
  res.render('index.jade', {}, function(err, html) {
    res.send(html);
  });
}

//public entry to the portfolio public view
module.exports.public = function(req, res, next){
  var portfolio = {}
  user.all(function(err, userInfos) {
    if(err !== null) {
      res.status(404).send("");
    }
    else {
      userInfos = userInfos[0];
      //name
      portfolio.user = {};
      if(userInfos.firstName.display || userInfos.lastName.display){
        portfolio.user.name = "";
        if(userInfos.firstName.display) portfolio.user.name += userInfos.firstName.value;
        if(userInfos.lastName.display) 
        {
          if(userInfos.firstName.display) portfolio.user.name += " ";
          portfolio.user.name += userInfos.lastName.value;
        }
      }
      //age
      if(userInfos.birthdayDate.display){
        var today = new Date();
        //we need to transform the date format from JJ/MM/AAAA to AAAA-MM-JJ to compute the age
        var datePattern = /(\d{2})[/.-](\d{2})[/.-](\d{4})/;
        var birthDate = new Date(userInfos.birthdayDate.value.replace(datePattern,'$3-$2-$1'));
        var age = today.getFullYear() - birthDate.getFullYear();
        var months = today.getMonth() - birthDate.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        portfolio.user.age = age;
      }
      //description
      if(userInfos.description.display){
        portfolio.user.description = userInfos.description.value;
      }
      //statut
      if(userInfos.status.display){
        portfolio.user.status = userInfos.status.value;
      }
      //localisation
      if(userInfos.localisation.display){
        portfolio.user.localisation = userInfos.localisation.value;
      }
      //hobbies
      if(userInfos.hobbies.display){
        var hobbies = userInfos.hobbies.value.split(",");
        hobbies.forEach(function(hobby, index, array){
          hobby = hobby.replace( /\s\s+/g, ' ' ); //replace all duplicated spaces by only one space
          hobby = hobby.trim(); //remove whitespaces from both sides of the string
          hobby = hobby.charAt(0).toUpperCase() + hobby.slice(1); //we transform the first letter to upper case
          hobbies[index] = hobby;
        });
        portfolio.user.hobbies = hobbies;
      }
      //keywords
      if(userInfos.keywords.display){
        var keywords = userInfos.keywords.value.split(",");
        keywords.forEach(function(keyword, index, array){
          keyword = keyword.replace( /\s\s+/g, ' ' ); //replace all duplicated spaces by only one space
          keyword = keyword.trim(); //remove whitespaces from both sides of the string
          keyword = keyword.charAt(0).toUpperCase() + keyword.slice(1); //we transform the first letter to upper case
          keywords[index] = keyword;
        });
        portfolio.user.keywords = keywords;
      }
      //after we request badges
      getBadges();
    }
  });
  
  function getBadges(){
    badgesGroup.all(function(err, badgesGroups) {
      if(err !== null) {
        res.status(404).send("");
      }
      else {
        var badge = {};
        badgesGroups.forEach(function(group, group_index, array){
          group.badges.forEach(function(badgeData, badge_index, array){
            if(badgeData.visible){
              if(!portfolio.badges) portfolio.badges = [];
              badge = {
                name : badgeData.name,
                issuerName : badgeData.issuerName,
                hostedUrl : badgeData.hostedUrl,
                description: badgeData.description,
                imageUrl: badgeData.imageUrl,
                isserUrl: badgeData.issuerUrl,
                issuedOn: badgeData.issuedOn
              }
              portfolio.badges.push(badge);
            }
          });
        });
        getDocuments();
      }
    });
  }
  
  function getDocuments(){
    portfolioDocument.all(function(err, documents) {
      if(err !== null) {
        res.status(404).send("");
      }
      else {
        var document = {};
        documents.forEach(function(documentData, index, array){
          if(documentData.visible){
            if(!portfolio.portfolios) portfolio.portfolios = {};
            if(!portfolio.portfolios[documentData.category]){
              portfolio.portfolios[documentData.category] = {
                "title": documentData.category,
                "documents": []
              };
            }
            document = {
              "title": documentData.title,
              "description": documentData.description,
              "url": documentData.url,
              "relatedWebsite": documentData.relatedWebsite,
              "creationDate": documentData.creationDate
            }
            portfolio.portfolios[documentData.category].documents.push(document);
          }
        });
        //now we build the html page
        res.render('public.jade', portfolio, function(err, html) {
          res.send(html);
        });
      }
    });
  }
}