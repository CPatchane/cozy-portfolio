var accounts = require('../models/accounts');

module.exports.list = function(req, res, next) {
  accounts.all(function(err, accountsInfos) {
    if(err !== null) {
      next(err);
    }
    else {
      var data = {"accountsInfos": accountsInfos}
      res.render('index.jade', data, function(err, html) {
        res.send(html);
      });
    }
  });
};

// We define another route that will handle accounts update (and first creation)
module.exports.update = function(req, res, next) {
  if(req.params.id === null){ //first time execution -> so we create it
    accounts.create(req.body, function(err) {
      if(err !== null) {
        next(err);
      }
      else {
        res.redirect('back');
      }
    });
  }else{
    accounts.find(req.params.id, function(err, accounts) {
      if(err !== null) {
        next(err);
      }
      else if(accounts === null) {
        res.status(404).send("Accounts infos not found. ERROR.");
      }
      else {
        accounts.updateAttributes(req.body, function(err) {
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
};
