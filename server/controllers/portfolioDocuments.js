var portfolioDocument = require('../models/portfolioDocument');
var accounts = require('../models/accounts');
var user = require('../models/user');
var request = require("request");

//function to get all documents
module.exports.list = function(req, res, next) {
  portfolioDocument.all(function(err, portfolioDocuments) {
    if(err !== null) {
      next(err);
    }
    else { //if success
      res.status(200).send(portfolioDocuments);
    }
  });
};

// function that will handle document creation
module.exports.add = function(req, res, next) {
  portfolioDocument.create(req.body, function(err, portfolioDocument) {
    if(err !== null) { //if error
      res.status(500).status("Erreur serveur pour l'ajout du document");
    }
    else { //if success
      res.status(200).send("Document ajouté avec succès.")
    }
  });
};

// function that will handle document deletion
module.exports.delete = function(req, res, next) {
  portfolioDocument.find(req.params.id, function(err, portfolioDocument) { //we find the document thanks to the id
    if(err !== null) {
      next(err);
    }
    else if(portfolioDocument === null) {
      res.status(404).send("Document not found");
    }
    else {//if it's found
      portfolioDocument.destroy(function(err) { //we delete it
        if(err !== null) {
          next(err);
        }
        else { //if success
          res.redirect('back');
        }
      });
    }
  });
};


// function that will handle document modification (editing mode ending)
module.exports.update = function(req, res, next) {
  portfolioDocument.find(req.params.id, function(err, portfolioDocument) { //we find the document thanks to the id
    if(err !== null) {
      next(err);
    }
    else if(portfolioDocument === null) {
      res.status(404).send("Document not found");
    }
    else {
      //we update the document thanks the data object get from the client application
      portfolioDocument.updateAttributes(req.body, function(err) {
        if(err !== null) {
          next(err);
        }
        else { //if success
          res.status(200).send("Document modifié avec succes.");
        }
      });
    }
  });
};


//function to update documents visibilities
module.exports.updateVisibilities = function(req, res, next) {
  portfolioDocument.all(function(err, portfolioDocuments) {
    if(err !== null) {
      res.status(500).send("ERROR server for documents updates");
    }
    else { //we update the visibilities of all documents thanks their ids
      portfolioDocuments.forEach(function(document, index, array){
        document.updateAttributes({"visible": req.body[document.id]}, function(err) {
          if(err !== null) {
            res.status(500).send("ERROR server to update a document visibility");
            return;
          }
        });
      });
      //we send a successful message when we reach the end without any errors
      res.status(200).send("Documents mis à jour avec succès");
    }
  });
}


//function to get DYB documents
module.exports.syncDYB = function(req, res, next) {
  portfolioDocument.all(function(err, portfolioDocuments) { //we need to get all documents
    if(err !== null) {
      next(err);
    }
    else { //if success, next step
      getDYBpreparation(portfolioDocuments);
    }
  });
  
  function getDYBpreparation(portfolioDocuments){
    accounts.all(function(err, accountsInfos) { //we need the oauth tokens of DYB to do the request
      if(err !== null) {
        res.status(500).send("ERROR to get account informations");
      }
      else {
        accountsInfos = accountsInfos[0];
        user.all(function(err, userInfos) {
            if(err !== null || userInfos[0].activeResumeId == 0) { //if no resume was selected in the user profile
              res.status(500).send("Vous n'avez pas choisi de CV DoYouBuzz au niveau de votre profil. Merci d'en choisir un et de réessayer");
              return;
            }
            else { //if we have the resume that the user has selected
              userInfos = userInfos[0];
              //we do the request to DYB
              syncDYBDocuments(portfolioDocuments, userInfos, accountsInfos);
            }
        });
      }
    });
  }
  
  function syncDYBDocuments(portfolioDocuments, userInfos, accountsInfos){
    //if we don't have any DYB tokens -> the DYB connection is needed in the settings view
    if(!accountsInfos.doYouBuzzOauthVerifierToken || !accountsInfos.doYouBuzzOauthVerifierTokenSecret){
      res.status(500).send("Erreur : Veuillez connecter votre compte DoYouBuzz dans les paramètres puis réssayer.");
    }else{
      //OAuth authentification parameters
      var oauth =
      { consumer_key: accountsInfos.doYouBuzzAPIKey,
      consumer_secret: accountsInfos.doYouBuzzAPISecret,
      token: accountsInfos.doYouBuzzOauthVerifierToken,
      token_secret: accountsInfos.doYouBuzzOauthVerifierTokenSecret
      };
      var url = 'https://api.doyoubuzz.com/cv/' + userInfos.activeResumeId; //url for the request
      request.get({url:url, oauth:oauth, json:true}, function (e, r, data) {
        //we get the data object as response with all information
        var portfolios = data.resume.portfolios.portfolio; //see the DoYouBuzz API documentation
        if(portfolios != undefined){ //if we have portfolios
          res.status(200).send(portfolios);
        }else{ //if there is not any documents
          res.status(404).send("Vous n'avez pas d'éléments de portfolio sur votre CV DoYouBuzz. Revérifier votre CV et votre choix dans la partie profil puis réessayer.");
        }
      });
    }
  }
  
  
}