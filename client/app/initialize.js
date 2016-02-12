var application = require('./application');

//entry point of the web application
$(function () {
  application.initialize();
  Backbone.history.start();
});