var user = require('../models/user');
var accounts = require('../models/accounts');
var request = require("request");

//first entry of the client application
module.exports.start = function(req, res, next){
  res.render('index.jade', {}, function(err, html) {
    res.send(html);
  });
}

module.exports.list = function(req, res, next) {
  user.all(function(err, userInfos) {
    if(err !== null) {
      next(err);
    }
    else {
      res.status(200).send(userInfos);
    }
  });
};

// We define another route that will handle user infos update (and first creation)
module.exports.update = function(req, res, next) {
  var bodyArguments = JSON.parse(req.body.data);
  var data = {
    "firstName" : {"value": bodyArguments.firstName, "display": bodyArguments.firstNameCB},
    "lastName" : {"value": bodyArguments.lastName, "display": bodyArguments.lastNameCB},
    "birthdayDate" : {"value": bodyArguments.birthdayDate, "display": bodyArguments.birthdayDateCB},
    "email" : {"value": bodyArguments.email, "display": bodyArguments.emailCB},
    "description" : {"value": bodyArguments.description, "display": bodyArguments.descriptionCB},
    "status" : {"value": bodyArguments.status, "display": bodyArguments.statusCB},
    "localisation" : {"value": bodyArguments.localisation, "display": bodyArguments.localisationCB},
    "activeResumeId" : bodyArguments.activeResumeId || "",
    "hobbies" : {"value": bodyArguments.hobbies, "display": bodyArguments.hobbiesCB},
    "keywords" : {"value": bodyArguments.keywords, "display": bodyArguments.keywordsCB}
  }
  if(req.body.id == ""){ //first time execution -> so we create it
    user.create(data, function(err) {
      if(err !== null) {
        res.status(500).send("ERROR");
      }
      else {
        res.status(200).send("Données sauvegardées");
      }
    });
  }else{
    user.find(req.body.id, function(err, user) {
      if(err !== null) {
        res.status(500).send("ERROR");
      }
      else if(user === null) {
        res.status(404).send("User infos not found. ERROR");
      }
      else {
        user.updateAttributes(data, function(err) {
          if(err !== null) {
            res.status(500).send("ERROR");
          }
          else {
            res.status(200).send("Changements sauvegardés");
          }
        });
      }
    });
  }
};

module.exports.getFromDYB = function(req, res, next) {
  accounts.all(function(err, accountsInfos) {
    if(err !== null) {
      next(err);
    }
    else {
      accountsInfos = accountsInfos[0];
      if(!accountsInfos.doYouBuzzOauthVerifierToken || !accountsInfos.doYouBuzzOauthVerifierTokenSecret){
        res.status(500).send("Erreur : Veuillez connecter votre compte DoYouBuzz dans les paramètres puis réssayer.");
      }else{
        var oauth =
        { consumer_key: accountsInfos.doYouBuzzAPIKey,
        consumer_secret: accountsInfos.doYouBuzzAPISecret,
        token: accountsInfos.doYouBuzzOauthVerifierToken,
        token_secret: accountsInfos.doYouBuzzOauthVerifierTokenSecret
        };
        var url = 'https://api.doyoubuzz.com/user'
        request.get({url:url, oauth:oauth, json:true}, function (e, r, data) {
          //path of profil photo with data.avatars.big
          //console.log(data)
          user.all(function(err, userInfos) {
            if(err !== null) {
              res.status(500).send("Veuillez d'abord entrer des données et les valider une première fois.");
            }
            else {
              userInfos = userInfos[0];
              var dataToUpdate = {
                "firstName": {"value": data.user.firstname, "display": userInfos.firstName.display},
                "lastName": {"value": data.user.lastname, "display": userInfos.lastName.display},
                "email": {"value": data.user.email, "display": userInfos.email.display},
                "resumes": data.user.resumes.resume,
              }
              if(userInfos.id == ""){ //first time execution -> so we create it
                user.create(dataToUpdate, function(err) {
                  if(err !== null) {
                    res.status(500).send("ERROR");
                  }
                  else {
                    res.status(200).send("Données récupérées et sauvegardées");
                  }
                });
              }else{
                user.find(userInfos.id, function(err, user) {
                  if(err !== null) {
                    res.status(500).send("ERROR");
                  }
                  else if(user === null) {
                    res.status(404).send("User infos not found. ERROR");
                  }
                  else {
                    user.updateAttributes(dataToUpdate, function(err) {
                      if(err !== null) {
                        res.status(500).send("ERROR");
                      }
                      else {
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
