var accounts = require('../models/accounts');
var request = require("request");

module.exports.list = function(req, res, next) {
  accounts.all(function(err, accountsInfos) {
    if(err !== null) {
      next(err);
    }
    else {
      res.status(200).send(accountsInfos);
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
      //console.log(userId);
			storeAndContinue(userId);
	});

  function storeAndContinue(userId){
    var data = {
      "openBadgesEmail" : req.body.OBemail,
      "openBadgesUserId" : userId || 0,
      "doYouBuzzAPIKey" : req.body.DYBapiKey,
      "doYouBuzzAPISecret" : req.body.DYBapiSecret,
      "doYouBuzzOauthVerifierToken" : "",
      "doYouBuzzOauthVerifierTokenSecret" : ""
    }
  //console.log(data);
  
  if(req.body.id == ""){ //first time execution -> so we create it
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
