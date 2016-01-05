var accounts = require('../models/accounts');
var request = require("request");

module.exports.list = function(req, res, next) {
  var gets = req.headers.referer;
  //var gets = "http://localhost:9104/apps/portfolio/?oauth_token=fc8b18c9707c268e62ad6b211f1adc0bb063eb1f&oauth_verifier=b35de4a8b6cfb18acecb6daafaa1e0cf72d0a308"
  var urlArguments = {};
  gets.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
     urlArguments[key] = value;
  });
  console.log(urlArguments);
  accounts.all(function(err, accountsInfos) {
    if(err !== null) {
      next(err);
    }
    else {
      if(Object.keys(urlArguments).length == 2 && urlArguments.oauth_verifier){//in this case this a return from DoYouBuzz
        getFinalTokenFromDYB(urlArguments, accountsInfos, res);
      }else{
        res.status(200).send(accountsInfos);
      }
    }
  });
};

// We define another route that will handle accounts update (and first creation)
module.exports.update = function(req, res, next) {
  //res.status(200).send(JSON.stringify(req.params));
  //res.render('index');
  //get userId from OpenBadges
  request({
		uri: "https://backpack.openbadges.org/displayer/convert/email",
		method: "POST",
		form: {
			email: req.body.OBemail
		}
		}, function(error, response, body) {
			var userId = JSON.parse(body).userId;
			storeAndContinue(userId);
	});

  function storeAndContinue(userId){
    var data = {
      "openBadgesEmail" : req.body.OBemail,
      "openBadgesUserId" : userId || 0,
      "doYouBuzzAPIKey" : req.body.DYBapiKey,
      "doYouBuzzAPISecret" : req.body.DYBapiSecret,
    };
    if(req.body.id == ""){ //first time execution -> so we create it
      data.doYouBuzzOauthVerifierToken = "";
      data.doYouBuzzOauthVerifierTokenSecret = "";
      data.doYouBuzzOldTokenSecret = "";
      accounts.create(data, function(err) {
        if(err !== null) {
          next(err);
        }
        else {
          res.redirect('back');
        }
      });
    }else{
      accounts.find(req.body.id, function(err, accounts) {
        if(err !== null) {
          next(err);
        }
        else if(accounts === null) {
          res.status(404).send("Accounts infos not found. ERROR.");
        }
        else {
          accounts.updateAttributes(data, function(err) {
            if(err !== null) {
              next(err);
            }
            else {
              res.redirect('back');
            }
          });
        }
      });
    }
  }
};


module.exports.getDYBConnection = function(req, res, next){
  var  oauth = { callback: req.body.callback, 
    consumer_key: req.body.DYBapiKey, 
    consumer_secret: req.body.DYBapiSecret
  }
  var url = 'http://www.doyoubuzz.com/fr/oauth/requestToken';
  
  request.post({url: url, oauth: oauth}, function (e, r, body) {
    var bodyArguments = {};
    var gets = "?"+body; //need a ? at the beginning of the string for the next regex matching
    gets.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      bodyArguments[key] = value;
    });
    console.log(bodyArguments);
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
        if(accountsInfos.length == 0){ //no accounts document exists
            data.openBadgesEmail = "";
            data.openBadgesUserId = "";
            data.doYouBuzzOauthVerifierToken = "";
            data.doYouBuzzOauthVerifierTokenSecret = "";
            accounts.create(data, function(err) {
              if(err !== null) {
                next(err);
              }
              else {
                res.status(200).send(body);
                //res.redirect('back');
              }
            });
        }else{
          accounts.find(accountsInfos[0].id, function(err, accounts) {
            if(err !== null) {
              next(err);
            }
            else if(accounts === null) {
              res.status(404).send("Accounts infos not found. ERROR.");
            }
            else {
              accounts.updateAttributes(data, function(err) {
                if(err !== null) {
                  next(err);
                }
                else {
                  res.status(200).send(body);
                  //res.redirect('back');
                }
              });
            }
          });
        }
      }
    });
  });
};


function getFinalTokenFromDYB(urlArguments, accountsInfos, res){
  var oauth =
      { consumer_key: accountsInfos[0].doYouBuzzAPIKey,
      consumer_secret: accountsInfos[0].doYouBuzzAPISecret,
      token: urlArguments.oauth_token,
      token_secret: accountsInfos[0].doYouBuzzOldTokenSecret,
      verifier: urlArguments.oauth_verifier
      }
  var url = 'http://www.doyoubuzz.com/fr/oauth/accessToken';
  
  request.post({url:url, oauth:oauth}, function (e, r, body) {
    // ready to make signed requests on behalf of the user
    var bodyArguments = {};
    var gets = "?"+body; //need a ? at the beginning of the string for the next regex matching
    gets.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      bodyArguments[key] = value;
    });
    if(Object.keys(bodyArguments).length == 0){ //no information returned by DYB
      accountsInfos[0].DYBResponse = "Nothing from DoYouBuzz. ERROR.";
      res.status(200).send(accountsInfos);
    }
    var data = {
      "doYouBuzzOauthVerifierToken" : bodyArguments.oauth_token,
      "doYouBuzzOauthVerifierTokenSecret" : bodyArguments.oauth_token_secret
    }
    accountsInfos[0].doYouBuzzOauthVerifierToken = data.doYouBuzzOauthVerifierToken
    accountsInfos[0].doYouBuzzOauthVerifierTokenSecret = data.doYouBuzzOauthVerifierTokenSecret;
    accounts.find(accountsInfos[0].id, function(err, accounts) {
            if(err !== null) {
              accountsInfos[0].DYBResponse = "ERROR Database";
              res.status(200).send(accountsInfos);
            }
            else if(accounts === null) {
              accountsInfos[0].DYBResponse = "Accounts infos not found. ERROR.";
              res.status(200).send(accountsInfos);
            }
            else {
              accounts.updateAttributes(data, function(err) {
                if(err !== null) {
                  accountsInfos[0].DYBResponse = "ERROR Database";
                  res.status(200).send(accountsInfos);
                }
                else {
                  accountsInfos[0].DYBResponse = "OK";
                  res.status(200).send(accountsInfos);
                }
              });
            }
          });
  });
}