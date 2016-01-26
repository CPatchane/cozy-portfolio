var portfolioDocument = require('../models/portfolioDocument');
var accounts = require('../models/accounts');
var user = require('../models/user');
var request = require("request");

module.exports.list = function(req, res, next) {
  portfolioDocument.all(function(err, portfolioDocuments) {
    if(err !== null) {
      next(err);
    }
    else {
      res.status(200).send(portfolioDocuments);
    }
  });
};

// We define a new route that will handle document creation
module.exports.add = function(req, res, next) {
  portfolioDocument.create(req.body, function(err, portfolioDocument) {
    if(err !== null) {
      res.status(500).status("Erreur serveur pour l'ajout du document");
    }
    else {
      res.status(200).send("Document ajouté avec succès.")
    }
  });
};

// We define another route that will handle document deletion
module.exports.delete = function(req, res, next) {
  portfolioDocument.find(req.params.id, function(err, portfolioDocument) {
    if(err !== null) {
      next(err);
    }
    else if(portfolioDocument === null) {
      res.status(404).send("Document not found");
    }
    else {
      portfolioDocument.destroy(function(err) {
        if(err !== null) {
          next(err);
        }
        else {
          res.redirect('back');
        }
      });
    }
  });
};


// We define another route that will handle document update
module.exports.update = function(req, res, next) {
  portfolioDocument.find(req.params.id, function(err, portfolioDocument) {
    if(err !== null) {
      next(err);
    }
    else if(portfolioDocument === null) {
      res.status(404).send("Document not found");
    }
    else {
      portfolioDocument.updateAttributes(req.body, function(err) {
        if(err !== null) {
          next(err);
        }
        else {
          res.status(200).send("Document modifié avec succes.");
        }
      });
    }
  });
};


//function to sync DYB documents
module.exports.syncDYB = function(req, res, next) {
  portfolioDocument.all(function(err, portfolioDocuments) {
    if(err !== null) {
      next(err);
    }
    else {
      getDYBpreparation(portfolioDocuments);
    }
  });
  
  function getDYBpreparation(portfolioDocuments){
    accounts.all(function(err, accountsInfos) {
      if(err !== null) {
        res.status(500).send("ERROR to get account informations");
      }
      else {
        accountsInfos = accountsInfos[0];
        user.all(function(err, userInfos) {
            if(err !== null || userInfos[0].activeResumeId == 0) {
              res.status(500).send("Vous n'avez pas choisi de CV DoYouBuzz au niveau de votre profil. Merci d'en choisir un et de réessayer");
            }
            else {
              userInfos = userInfos[0];
              syncDYBDocuments(portfolioDocuments, userInfos, accountsInfos);
            }
        });
      }
    });
  }
  
  function syncDYBDocuments(portfolioDocuments, userInfos, accountsInfos){
    if(!accountsInfos.doYouBuzzOauthVerifierToken || !accountsInfos.doYouBuzzOauthVerifierTokenSecret){
      res.status(500).send("Erreur : Veuillez connecter votre compte DoYouBuzz dans les paramètres puis réssayer.");
    }else{
      var oauth =
      { consumer_key: accountsInfos.doYouBuzzAPIKey,
      consumer_secret: accountsInfos.doYouBuzzAPISecret,
      token: accountsInfos.doYouBuzzOauthVerifierToken,
      token_secret: accountsInfos.doYouBuzzOauthVerifierTokenSecret
      };
      var url = 'https://api.doyoubuzz.com/cv/' + userInfos.activeResumeId;
      request.get({url:url, oauth:oauth, json:true}, function (e, r, data) {
        //console.log(data)
        var portfolios = data.resume.portfolios.portfolio;
        if(portfolios != undefined){
          console.log(portfolios);
          res.status(200).send(portfolios);
        }else{
          res.status(404).send("Vous n'avez pas d'éléments de portfolio sur votre CV DoYouBuzz. Revérifier votre CV et votre choix dans la partie profil puis réessayer.");
        }
      });
    }
  }
  
  
}