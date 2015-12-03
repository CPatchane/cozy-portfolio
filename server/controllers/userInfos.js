var user = require('../models/user');

module.exports.list = function(req, res, next) {
  user.all(function(err, userInfos) {
    if(err !== null) {
      next(err);
    }
    else {
      var data = {"userInfos": userInfos}
      res.render('accountSettings.jade', data, function(err, html) {
        res.send(html);
      });
    }
  });
};

// We define another route that will handle user infos update (and first creation)
module.exports.update = function(req, res, next) {
  if(req.params.id === null){ //first time execution -> so we create it
    user.create(req.body, function(err) {
      if(err !== null) {
        next(err);
      }
      else {
        res.redirect('back');
      }
    });
  }else{
    user.find(req.params.id, function(err, user) {
      if(err !== null) {
        next(err);
      }
      else if(user === null) {
        res.status(404).send("User infos not found. ERROR");
      }
      else {
        user.updateAttributes(req.body, function(err) {
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
