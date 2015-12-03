var badgesGroup = require('../models/badgesGroup');

module.exports.list = function(req, res, next) {
  badgesGroup.all(function(err, badgesGroups) {
    if(err !== null) {
      next(err);
    }
    else {
      var data = {"badgesGroups": badgesGroups}
      res.render('choices.jade', data, function(err, html) {
        res.send(html);
      });
    }
  });
};

// We define a new route that will handle badges group creation
module.exports.add = function(req, res, next) {
  badgesGroup.create(req.body, function(err, badgesGroup) {
    if(err !== null) {
      next(err);
    }
    else {
      res.redirect('back');
    }
  });
};

// We define another route that will handle badges group deletion
module.exports.delete = function(req, res, next) {
  badgesGroup.find(req.params.id, function(err, badgesGroup) {
    if(err !== null) {
      next(err);
    }
    else if(badgesGroup === null) {
      res.status(404).send("Badges group not found");
    }
    else {
      badgesGroup.destroy(function(err) {
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


// We define another route that will handle badges group update
module.exports.update = function(req, res, next) {
  badgesGroup.find(req.params.id, function(err, badgesGroup) {
    if(err !== null) {
      next(err);
    }
    else if(badgesGroup === null) {
      res.status(404).send("Badges group not found");
    }
    else {
      badgesGroup.updateAttributes(req.body, function(err) {
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