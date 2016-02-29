var badgesGroup = require('../models/badgesGroup');
var accounts = require('../models/accounts');
var request = require("request");

//function to get all badges groups from database
module.exports.list = function(req, res, next) {
  badgesGroup.all(function(err, badgesGroups) {
    if(err !== null) {
      next(err);
    }
    else {
      res.status(200).send(badgesGroups);
    }
  });
};


// function to handle badges group syncing with openbadge backpack
module.exports.syncWithOB = function(req, res, next) {
  //firstly, we destroy all badges to be sure to get all correct badges without duplicates and errors
  badgesGroup.all(function(err, badgesGroups) {
    if(err !== null) {
      res.status(500).send("Error badges group to remove");
    }
    else {
      badgesGroups.forEach(function(element, index, array){ // for each badges group
        badgesGroup.find(element.id, function(err, badgesGroup) {
          if(err !== null) {
            next(err);
          }
          else if(badgesGroup === null) {
            res.status(404).send("Badges group to remove not found");
          }
          else {
            // we destroy this group
            badgesGroup.destroy(function(err) {
              if(err !== null) {
                next(err);
              }
              else {
                if(index == badgesGroups.length-1){
                  //when all badges group are destroy, we request all badges from OpenBadges backpack
                  getBadges();
                }
              }
            });
          }
        });
      });
      if(badgesGroups.length == 0) getBadges(); // if there are no badges in the database, we request directly from OpenBadges
    }
  });
  
  //function to request all badges from OpenBadges thanks to the userId
  function getBadges(){
    var userId = 0;//openBadges user id
    var groups = []; //to store all badges groups
    var groupBadges = []; //to store all badges of a group
    var dataToUpdate = {}; //data that will be save into the database
    
    accounts.all(function(err, accountsInfos) {
      if(err !== null) {
        res.status(500).send(" ERROR to find accounts informations");
      }else if(!accountsInfos.length){//if no documents
        res.status(404).send("Aucun profil OpenBadges trouvé, veuillez ajouter ou corriger votre e-mail OpenBadges dans la section paramètres avant de réessayer. Merci.");
      } else {
        userId = accountsInfos[0].openBadgesUserId;
        if(userId !== undefined && userId != 0){//if we have a userId we continue
          getBadgeGroups(userId);//we request badges groups from OpenBadges
        }else{
          res.status(404).send("Aucun profil OpenBadges trouvé, veuillez ajouter ou corriger votre e-mail OpenBadges dans la section paramètres avant de réessayer. Merci.");
          //the user didn't register a OpenBadges email or the email doesn't match to an OpenBadges profile
        }
      }
    });
    
    //function to request badges groups from OpenBadges
    function getBadgeGroups(userId){
      request({
      uri: "https://backpack.openbadges.org/displayer/"+userId+"/groups",
      method: "GET",
      }, function(error, response, body) {
        groups = JSON.parse(body).groups; //we put all groups in the groups array
        if(groups.length == 0) res.status(404).send("No badges groups found"); //if there is not any groups
        groups.forEach(function(element, index, array){//for each group
          dataToUpdate = {}; //we reset this object
          dataToUpdate.groupId = element.groupId; //id of this group of badges (id from the OpenBadges backpack)
          dataToUpdate.name = element.name; // name of the group
          dataToUpdate.totalBadges = element.badges; //total number of badges
          dataToUpdate.badges = []; //all badges of this group we will be in this array
          if(index == groups.length-1){//if this is the last group to be updated
            if(dataToUpdate.totalBadges > 0){//if there is at least one badge in this group
                getBadgesFromGroup(dataToUpdate, true); //we are now getting all badges for this group and save in the database
                // the second parameter is used to say that is the last badges group, it's true here so the next function will 
                //send a successful message to the client app
            }else{
              res.status(200).send("All badges updated");//successful response message
            }
          }else{
            if(dataToUpdate.totalBadges > 0){//if there is at least one badge in this group
              getBadgesFromGroup(dataToUpdate, false); //we are now getting all badges for this group and save in the database
            }
          }
        });
      });
    }
    //final step, we request all badges of the group and save the group into the database
    function getBadgesFromGroup(dataToUpdate, lastUpdate){
      request({
        uri: "https://backpack.openbadges.org/displayer/"+userId+"/group/"+dataToUpdate.groupId,
        method: "GET",
        }, function(error, response, body) {
          groupBadges = JSON.parse(body).badges;//all badges
          groupBadges.forEach(function(element, index, array){ 
            //for each badge we got all its data and store it in the object to save in the database
            dataToUpdate.badges[index] = {
              "lastValidated": element.lastValidated,
              "hostedUrl": element.hostedUrl,
              "name": element.assertion.badge.name,
              "description": element.assertion.badge.description,
              "imageUrl": element.imageUrl,
              "criteria": element.assertion.badge.criteria,
              "issuerName": element.assertion.badge.issuer.name,
              "issuerUrl": element.assertion.badge.issuer.origin,
              "issuedOn": element.assertion.issued_on,
              "visibility":false
            }
          });
          //here we store data in the database, we create a new document with the badgesGroup model
          badgesGroup.create(dataToUpdate, function(err, badgesGroup) {
            if(err !== null) {
              res.status(500).send("ERROR badges group creation")
            }else{
              if(lastUpdate){//that was the last badges group to update
                res.status(200).send("All badges updated");
              }
            }
          });
      });
    }
  }
};


//function to update badges visibilities
module.exports.updateBadgesVisibilities = function(req, res, next) {
  //get data from the application
  var badgesSent = req.body;

  //get all badges groups from database
  badgesGroup.all(function(err, badgesGroups) {
    if(err !== null) {
      res.status(500).send("Error badges group to update");
    }
    else {
      var badges = [];
      if(badgesGroups.length == 0) res.status(200).send("No badges in the database");
      //we create an updated array of badges for each group
      badgesGroups.forEach(function(group, index, array){
        badges = group.badges;
        badges.forEach(function(badge, index, array){
           badge.visibility = badgesSent[badge.name];
        });
        //and we update it each time
        //if no error we continue, and when we reach the last element we send a success response to the client app
        group.updateAttributes({'badges':badges}, function(err) {
          if(err !== null) {
            res.status(500).send("ERROR");
          }else{
            if(index == (badgesGroups.length-1)){
              res.status(200).send("All badges updated");
            }
          }
        });
      });
    }
  });
}