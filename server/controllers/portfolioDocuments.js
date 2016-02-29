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
        if(req.body[document.id] === undefined) return; //to avoid errors due to missing id
        document.updateAttributes({"visibility": req.body[document.id]}, function(err) {
          if(err !== null) {//should not happen, the case where id is not found is handled just before
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
//Due to some functional limitations of the DoYouBuzz API, we here handle only documents which are images or documents (pdf, docx...)
module.exports.syncDYB = function(req, res, next) {
    accounts.all(function(err, accountsInfos) { //we need the oauth tokens of DYB to do the request
      if(err !== null) {
        res.status(500).send("ERROR to get account informations");
      }
      else {
        accountsInfos = accountsInfos[0];
        user.all(function(err, userInfos) { //to get the active resume id
            if(err !== null || userInfos[0].activeResumeId == 0) { //if no resume was selected in the user profile
              res.status(404).send("Soit vous n'avez connecté votre compte DoYouBuzz dans le menu paramètre soit vous n'avez pas choisi de CV DoYouBuzz au niveau de votre profil. Merci de vérifier et de réessayer.");
              return;
            }
            else { //if we have the resume that the user has selected
              userInfos = userInfos[0];
              //we do the request to DYB thanks to the active resume id and user DYB tokens
              getDYBDocuments(userInfos, accountsInfos);
            }
        });
      }
    });
  
  //function to get DYB documents and create/update them
  function getDYBDocuments(userInfos, accountsInfos){
    //if we don't have any DYB tokens -> the DYB connection is needed in the settings view
    if(!accountsInfos.doYouBuzzOauthVerifierToken || !accountsInfos.doYouBuzzOauthVerifierTokenSecret){
      res.status(404).send("Veuillez connecter votre compte DoYouBuzz dans les paramètres puis réssayer.");
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
        if(data.resume.portfolios){//if there is at least one document
          var portfolios = data.resume.portfolios.portfolio; //see the DoYouBuzz API documentation
          
          //we need to get all documents gotten from the external source in the database
          //if the id matches that will be updated instead of create a new one
          portfolioDocument.request("bySource", {"key": "DoYouBuzz"}, function(err, results) {
            if(err !== null) {
              next(err);
            } else { //if success
              var documentsUpatesToSend = []; //final updated documents will be sent to the client app stored in this array
              //we need all ids of documents from DoYouBuzz alredy created
              var documentsToUpdate = {};
              results.forEach(function(document, index, array){
                documentsToUpdate[document.idSource] = document._id;
              });
              
              var documentData = {};//document object sent to be created or updated
              var currentDocument = {}; //current document for the loop
              for(var index=0; index<portfolios.length; index++){
                currentDocument = portfolios[index];
                if(!currentDocument.path) continue; //if there is no path from DYB, we don't take this document
                //we fill out the document object to be sent
                documentData = {
                  "title": currentDocument.title,
                  "url": "http://www.doyoubuzz.com" + currentDocument.path,
                  "relatedWebsite": currentDocument.url,
                  "description": currentDocument.description.replace(/(\r\n|\n|\r)/gm, "</br>"),
                  "creationDate": currentDocument.createDate.split("-").reverse().join("/"), //we want dd/mm/yyyy
                  "idSource": currentDocument.id,
                  "source": "DoYouBuzz",
                  "visibility": false
              	}
                //to get the category we will use the extension of the path
                //so we can get only two kinds of document : images or documents
                var regexImageExtension = /\.(jpe?g|png|gif|bmp|tiff)$/i; //extensions avalaible : jpeg, jpg, png, gif, bmp, tiff
                if(regexImageExtension.test(currentDocument.path)){ //it's an image
                  documentData.category = "Mes Images"
                }else{ //it's a document
                  documentData.category = "Mes documents"
                }
                if(!documentsToUpdate[currentDocument.id]){//this document doesn't exist, we create it
                  portfolioDocument.create(documentData, function(err, portfolioDocumentCreated) {
                    if(err !== null) { //if error
                      res.status(500).status("Erreur serveur pour l'ajout d'un document");
                      return;
                    }
                  });
                }else{//we udpate the existing document
                  portfolioDocument.find(documentsToUpdate[currentDocument.id], function(err, document) { //we find the document thanks to the id
                    if(err !== null || document == null) { //if error
                      res.status(500).status("Erreur serveur pour trouver le document à mettre à jour");
                      return;
                    }
                    //here we are sure that the document exist
                    //we update the document thanks the data object get from the client application
                    document.updateAttributes(documentData, function(err) {
                      if(err !== null) { //if error
                        res.status(500).status("Erreur serveur pour la mise à jour d'un document");
                        return;
                      }
                    });
                  });
                }
                documentData._id = documentsToUpdate[currentDocument.id]; //we need the id for the client app
                //stored to be sent to the client app
                documentsUpatesToSend.push(documentData);
              }
              res.status(200).send(documentsUpatesToSend);//we send a successful message
            }
          });
        }else{ //if there is not any document
          res.status(404).send("Error, no documents from DoYouBuzz");
        }
      });
    }
  }
  
}