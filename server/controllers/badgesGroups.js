var badgesGroup = require('../models/badgesGroup');
var accounts = require('../models/accounts');
var request = require("request");

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


/*module.exports.destroy = function(req, res, next){
   //we destroy all badges already present - that needs to be optimised
  badgesGroup.all(function(err, badgesGroups) {
    if(err !== null) {
      res.status(500).send("Error badges group to remove");
    }
    else {
      badgesGroups.forEach(function(element, index, array){
        badgesGroup.find(element.id, function(err, badgesGroup) {
          if(err !== null) {
            next(err);
          }
          else if(badgesGroup === null) {
            res.status(404).send("Badges group to remove not found");
          }
          else {
            badgesGroup.destroy(function(err) {
              if(err !== null) {
                next(err);
              }
              else {
                if(index == badgesGroups.length-1){
                  res.status(200).send("All groups removed");
                }
              }
            });
          }
        });
      });
      if(badgesGroups.length == 0) res.status(200).send("No groups to removed");
    }
  });
};*/


// We define another route that will handle badges group syncing with openbadge backpack
module.exports.syncWithOB = function(req, res, next) {
  //first, we destroy all badges to be sure to get all correct badges without duplicates and errors
  badgesGroup.all(function(err, badgesGroups) {
    if(err !== null) {
      res.status(500).send("Error badges group to remove");
    }
    else {
      badgesGroups.forEach(function(element, index, array){
        badgesGroup.find(element.id, function(err, badgesGroup) {
          if(err !== null) {
            next(err);
          }
          else if(badgesGroup === null) {
            res.status(404).send("Badges group to remove not found");
          }
          else {
            badgesGroup.destroy(function(err) {
              if(err !== null) {
                next(err);
              }
              else {
                if(index == badgesGroups.length-1){
                  getBadges();
                }
              }
            });
          }
        });
      });
      if(badgesGroups.length == 0) getBadges();
    }
  });
  
  //get all badges from OpenBadges thanks to the userId
  function getBadges(){
    var userId = 0;
    var groups = [];
    var groupBadges = [];
    var dataToUpdate = {};
    
    accounts.all(function(err, accountsInfos) {
      if(err !== null) {
        res.status(404).send(" ERROR to find accounts informations");
      }
      else {
        userId = accountsInfos[0].openBadgesUserId;
        if(userId !== undefined && userId != 0){
          getBadgeGroups(userId);
        }else{
          res.status(404).send("No userId found");
        }
      }
    });
    
    
    function getBadgeGroups(userId){
      request({
      uri: "https://backpack.openbadges.org/displayer/"+userId+"/groups",
      method: "GET",
      }, function(error, response, body) {
        groups = JSON.parse(body).groups;
        if(groups.length == 0) res.status(404).send("No badges groups found");
        groups.forEach(function(element, index, array){
          dataToUpdate = {};
          dataToUpdate.groupId = element.groupId;
          dataToUpdate.name = element.name;
          dataToUpdate.totalBadges = element.badges;
          dataToUpdate.badges = [];
          if(index == groups.length-1){//last group to update
            if(dataToUpdate.totalBadges > 0){//we don't want empty groups
                getBadgesFromGroup(dataToUpdate, true); //get all badges for each group
            }else{
              res.status(200).send("All badges updated");
            }
          }else{
            if(dataToUpdate.totalBadges > 0){//we don't want empty groups
              getBadgesFromGroup(dataToUpdate, false); //get all badges for each group
            }
          }
        });
      });
    }
    
    function getBadgesFromGroup(data, lastUpdate){
      request({
        uri: "https://backpack.openbadges.org/displayer/"+userId+"/group/"+data.groupId,
        method: "GET",
        }, function(error, response, body) {
          groupBadges = JSON.parse(body).badges;
          groupBadges.forEach(function(element, index, array){
            data.badges[index] = {
              "lastValidated": element.lastValidated,
              "hostedUrl": element.hostedUrl,
              "name": element.assertion.badge.name,
              "description": element.assertion.badge.description,
              "imageUrl": element.imageUrl,
              "criteria": element.assertion.badge.criteria,
              "issuerName": element.assertion.badge.issuer.name,
              "issuerUrl": element.assertion.badge.issuer.origin,
              "issuedOn": element.assertion.issued_on,
              "visible":false
            }
          });
          //console.log(data);
          //here we store data in the database about badges
          badgesGroup.create(data, function(err, badgesGroup) {
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
           badge.visible = badgesSent[badge.name];
        });
        //and we update it each time, if no error we continue
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