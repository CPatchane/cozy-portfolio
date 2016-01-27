//this controller is used only to start the cozycloud application and serve the public view of the portfolio

//first entry of the client application
module.exports.start = function(req, res, next){
  res.render('index.jade', {}, function(err, html) {
    res.send(html);
  });
}

//public entry to the portfolio public view
module.exports.public = function(req, res, next){
  res.render('public.jade', {}, function(err, html) {
    res.send(html);
  });
}