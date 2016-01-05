var user = require('../models/user');

//fist entry of the client application
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
