var portfolioDocument = require('../models/portfolioDocument');

module.exports.list = function(req, res, next) {
  portfolioDocument.all(function(err, portfolioDocuments) {
    if(err !== null) {
      next(err);
    }
    else {
      var data = {"portfolioDocuments": portfolioDocuments}
      res.render('portfolio.jade', data, function(err, html) {
        res.send(html);
      });
    }
  });
};

// We define a new route that will handle document creation
module.exports.add = function(req, res, next) {
  portfolioDocument.create(req.body, function(err, portfolioDocument) {
    if(err !== null) {
      next(err);
    }
    else {
      res.redirect('back');
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
          res.redirect('back');
        }
      });
    }
  });
};