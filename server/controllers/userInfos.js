var user = require('../models/user');
var accounts = require('../models/accounts');
var request = require("request");

//to get user information
module.exports.list = function(req, res, next) {
  user.all(function(err, userInfos) {
    if(err !== null) {
      next(err);
    }
    else { //if success
      res.status(200).send(userInfos);
    }
  });
};

// function that will handle user infos update (and its first creation)
module.exports.update = function(req, res, next) {
  //we get data from the client app
  var bodyArguments = JSON.parse(req.body.data);
  //we create the object that will be used to update user information into the database
  var data = {
    "firstName" : {"value": bodyArguments.firstName, "visibility": bodyArguments.firstNameCB},
    "lastName" : {"value": bodyArguments.lastName, "visibility": bodyArguments.lastNameCB},
    "birthdayDate" : {"value": bodyArguments.birthdayDate, "visibility": bodyArguments.birthdayDateCB},
    "email" : {"value": bodyArguments.email, "visibility": bodyArguments.emailCB},
    "description" : {"value": bodyArguments.description, "visibility": bodyArguments.descriptionCB},
    "status" : {"value": bodyArguments.status, "visibility": bodyArguments.statusCB},
    "localisation" : {"value": bodyArguments.localisation, "visibility": bodyArguments.localisationCB},
    "activeResumeId" : bodyArguments.activeResumeId || "",
    "hobbies" : {"value": bodyArguments.hobbies, "visibility": bodyArguments.hobbiesCB},
    "keywords" : {"value": bodyArguments.keywords, "visibility": bodyArguments.keywordsCB}
  }
  if(req.body.id == ""){ //first time execution -> so we create it
    user.create(data, function(err) {
      if(err !== null) {
        res.status(500).send("ERROR");
      }
      else {//document created and saved
        res.status(200).send("Données sauvegardées");
      }
    });
  }else{
    user.find(req.body.id, function(err, user) { // we find the document thanks to the id
      if(err !== null) {
        res.status(500).send("ERROR");
      }
      else if(user === null) {
        res.status(404).send("User infos not found. ERROR");
      }
      else {//if found we update it
        user.updateAttributes(data, function(err) {
          if(err !== null) {
            res.status(500).send("ERROR");
          }
          else { //if success
            res.status(200).send("Changements sauvegardés");
          }
        });
      }
    });
  }
};

//function to get user information from DoYouBuzz
module.exports.getFromDYB = function(req, res, next) {
  accounts.all(function(err, accountsInfos) {
    if(err !== null) {
      next(err);
    }
    else {
      accountsInfos = accountsInfos[0];//there is only one element/document for accounts information
      //if we don't find tokens, the user have to connect the account in the accountSettings/Parametres page
      if(!accountsInfos || !accountsInfos.doYouBuzzOauthVerifierToken || !accountsInfos.doYouBuzzOauthVerifierTokenSecret){
        res.status(404).send("Erreur : Veuillez connecter votre compte DoYouBuzz dans les paramètres puis réssayer.");
      }else{
        //Oauthentication parameters
        var oauth =
        { consumer_key: accountsInfos.doYouBuzzAPIKey,
        consumer_secret: accountsInfos.doYouBuzzAPISecret,
        token: accountsInfos.doYouBuzzOauthVerifierToken,
        token_secret: accountsInfos.doYouBuzzOauthVerifierTokenSecret
        };
        var url = 'https://api.doyoubuzz.com/user'
        request.get({url:url, oauth:oauth, json:true}, function (e, r, data) {
          //path of profil -> photo with data.avatars.big
          user.all(function(err, userInfos) {
            if(err !== null) {
              res.status(500).send("Veuillez d'abord entrer des données et les valider une première fois.");
            }
            else {
              userInfos = userInfos[0]; //there is only one element/document for user information
              //object used to update the user information element/document
              var firstNameVisibility = userInfos.firstName ? userInfos.firstName.visibility : false;
              var lastNameVisibility = userInfos.lastName ? userInfos.lastName.visibility : false;
              var emailVisibility = userInfos.email ? userInfos.email.visibility : false;
              var dataToUpdate = {
                "firstName": {"value": data.user.firstname, "visibility": firstNameVisibility},
                "lastName": {"value": data.user.lastname, "visibility": lastNameVisibility},
                "email": {"value": data.user.email, "visibility": emailVisibility},
                "resumes": data.user.resumes.resume,
              }
              if(userInfos.id == ""){ //first time execution -> so we create it
                user.create(dataToUpdate, function(err) {
                  if(err !== null) {
                    res.status(500).send("ERROR");
                  }
                  else {//created and saved
                    res.status(200).send("Données récupérées et sauvegardées");
                  }
                });
              }else{
                user.find(userInfos.id, function(err, user) { //we find thanks to the id
                  if(err !== null) {
                    res.status(500).send("ERROR");
                  }
                  else if(user === null) {
                    res.status(404).send("User infos not found. ERROR");
                  }
                  else {//we update it
                    user.updateAttributes(dataToUpdate, function(err) {
                      if(err !== null) {
                        res.status(500).send("ERROR");
                      }
                      else {//if success
                        res.status(200).send("Données récupérées et sauvegardées");
                      }
                    });
                  }
                });
              }
            }
          });
        })
      }
    }
  });
};
