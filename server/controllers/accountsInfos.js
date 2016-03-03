var accounts = require('../models/accounts');
var request = require("request");

//function to get an object with accountsInfos information
module.exports.list = function(req, res, next) {
  //in case of DYB authentication callback, we get tokens from this callback in the http header (referer)
  var gets = req.headers.referer;//so we get this uri
  var urlArguments = {};
  //getting data from this uri
  gets.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
     urlArguments[key] = value;
  });
  //function to get all accounts documents (it's a unique document for accounts, we will use accountInfos[0] to get its information)
  accounts.all(function(err, accountsInfos) {
    //if error
    if(err !== null) {
      next(err);
    }
    else {
      //if it's a callback from DYB, we continue the DoYouBuzz account connection process
      if(Object.keys(urlArguments).length == 2 && urlArguments.oauth_verifier){//in this case this a return from DoYouBuzz
        getFinalTokenFromDYB(urlArguments, accountsInfos, res);
      }else{ // if it's not, we just return the accountsInfos information
        res.status(200).send(accountsInfos);
      }
    }
  });
};

// Function to update the accountsInfos document
module.exports.update = function(req, res, next) {
  //get userId from OpenBadges
  request({
		uri: "https://backpack.openbadges.org/displayer/convert/email",
		method: "POST",
		form: {
			email: req.body.OBemail
		}
		}, function(error, response, body) {
			var userId = JSON.parse(body).userId;
      //with the user id we are now going to store all informations
			storeAndContinue(userId);
	});

  function storeAndContinue(userId){
    //openBadges user id and information from accountSettings page inputs
    var data = {
      "openBadgesEmail" : req.body.OBemail || "",
      "openBadgesUserId" : userId || 0,
      "doYouBuzzAPIKey" : req.body.DYBapiKey || "",
      "doYouBuzzAPISecret" : req.body.DYBapiSecret || "",
    };
    if(req.body.id == ""){ //first time execution -> so we create the accountsInfos document
      //we create the document
      accounts.create(data, function(err) {
        if(err !== null) {
          next(err);
        }
        else {
          //send success response back to user page
          res.redirect('back');
        }
      });
    }else{
      //we look for the document thanks to the id
      accounts.find(req.body.id, function(err, accounts) {
        if(err !== null) {
          next(err);
        }
        else if(accounts === null) {//should not happen because the accountsInfos should be already created here
          res.status(500).send("Accounts infos not found. ERROR.");
        }
        else {
          //we update all information
          accounts.updateAttributes(data, function(err) {
            if(err !== null) {
              next(err);
            }
            else {
              //send success response back to user page
              res.redirect('back');
            }
          });
        }
      });
    }
  }
};


//function to get the DYB authentication page uri (the user will go to this page to accept the authentication and to get information from DYB)
module.exports.getDYBConnection = function(req, res, next){
  var  oauth = { callback: req.body.callback, 
    consumer_key: req.body.DYBapiKey, 
    consumer_secret: req.body.DYBapiSecret
  }
  var url = 'http://www.doyoubuzz.com/fr/oauth/requestToken';
  //DoYouBuzz will retrun a string with the oauth_token_secret and other elements
  request.post({url: url, oauth: oauth}, function (e, r, body) {
    var bodyArguments = {};
    if(body == ""){ // if doYouBuzz responses nothing we stop here
      res.status(404).send("Aucune réponse de DoYouBuzz. Veuillez revérifier vos clés API ou réessayer ultérieurement.");
      return;
    }
    var gets = "?"+body; //need a ? at the beginning of the string for the next regex matching
    gets.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      bodyArguments[key] = value;
    });
    //we save this first oauth token into the database
    accounts.all(function(err, accountsInfos) {
      if(err !== null) {
        next(err);
      }
      else {
        var data ={
            "doYouBuzzAPIKey" : req.body.DYBapiKey,
            "doYouBuzzAPISecret" : req.body.DYBapiSecret,
            "doYouBuzzOldTokenSecret" : bodyArguments.oauth_token_secret
          }
        if(accountsInfos.length == 0){ //no accounts document exists so we create it
            accounts.create(data, function(err) {
              if(err !== null) {
                next(err);
              }
              else {
                // we send a successful response with the new information to the client app
                //we will append this string  to the correct uri in the client app in order to go the the authentication page
                res.status(200).send(body);
              }
            });
        }else{
          //if an accountsInfos document exist we update it
          accounts.find(accountsInfos[0].id, function(err, accounts) {
            if(err !== null) {
              next(err);
            }
            else if(accounts === null) { //should not happen because at this step, the accountsInfos document should be already updated
              res.status(404).send("Accounts infos not found. ERROR.");
            }
            else {
              accounts.updateAttributes(data, function(err) {
                if(err !== null) {
                  next(err);
                }
                else {
                  // we send a successful response with the full uri arguments to the client app
                  //we will append this string  to the correct uri in the client app in order to go the the authentication page
                  res.status(200).send(body);
                }
              });
            }
          });
        }
      }
    });
  });
};


//function to get the final token from DoYouBuzz, final step of the authentication process
//these final token will be use to get DoYouBuzz without other authentication each time
function getFinalTokenFromDYB(urlArguments, accountsInfos, res){
  //request settings
  var oauth =
      { consumer_key: accountsInfos[0].doYouBuzzAPIKey,
      consumer_secret: accountsInfos[0].doYouBuzzAPISecret,
      token: urlArguments.oauth_token,
      token_secret: accountsInfos[0].doYouBuzzOldTokenSecret,
      verifier: urlArguments.oauth_verifier
      }
  var url = 'http://www.doyoubuzz.com/fr/oauth/accessToken';
  
  //request to the url above
  request.post({url:url, oauth:oauth}, function (e, r, body) {
    var bodyArguments = {};
    var gets = "?"+body; //need a ? at the beginning of the string for the next regex matching
    //we get all arguments value from the uri
    gets.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      bodyArguments[key] = value;
    });
    if(Object.keys(bodyArguments).length == 0){ //no information returned by DYB, this case should not happen (expect DYB plateform issues)
      accountsInfos[0].DYBResponse = "Nothing from DoYouBuzz. ERROR.";
      res.status(500).send(accountsInfos);
      return;
    }
    // we update the accountsInfos document with that token
    var data = {
      "doYouBuzzOauthVerifierToken" : bodyArguments.oauth_token,
      "doYouBuzzOauthVerifierTokenSecret" : bodyArguments.oauth_token_secret
    }
    //we update the object which will be sent to the client app
    accountsInfos[0].doYouBuzzOauthVerifierToken = data.doYouBuzzOauthVerifierToken
    accountsInfos[0].doYouBuzzOauthVerifierTokenSecret = data.doYouBuzzOauthVerifierTokenSecret;
    accounts.find(accountsInfos[0].id, function(err, accounts) {
            if(err !== null) {
              accountsInfos[0].DYBResponse = "ERROR Database";
              res.status(500).send(accountsInfos);
            }
            else if(accounts === null) { //should not happen because the document should be created in a previous step (in getDYBConnection() function)
              accountsInfos[0].DYBResponse = "Accounts infos not found. ERROR.";
              res.status(500).send(accountsInfos);
            }
            else {
              //we update the document
              accounts.updateAttributes(data, function(err) {
                if(err !== null) {
                  accountsInfos[0].DYBResponse = "ERROR Database";
                  res.status(500).send(accountsInfos);
                }
                else {//the token is saved with success
                  accountsInfos[0].DYBResponse = "OK";
                  res.status(200).send(accountsInfos);
                }
              });
            }
          });
  });
}
