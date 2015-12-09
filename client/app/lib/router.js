var application = require('../application');

module.exports = Backbone.Router.extend({
  routes: {
    '': 'home',
    'portfolio': 'portfolio',
    'choices': 'choices',
    'accountSettings': 'accountSettings'
  },

  home: function () {
    $('body').html(application.homeView.render().el);
  },
  
  portfolio: function () {
    $('body').html(application.portfolioView.render().el);
  },
  
  choices: function () {
    $('body').html(application.choicesView.render().el);
  },
  
  accountSettings: function () {
    $('body').html(application.accountSettingsView.render().el);
  }
});
