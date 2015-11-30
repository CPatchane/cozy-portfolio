var application = require('../application');

module.exports = Backbone.Router.extend({
  routes: {
    '': 'home',
    'portfolio': 'portfolio',
    'preferences': 'preferences',
    'accountSettings': 'accountSettings'
  },

  home: function () {
    $('body').html(application.homeView.render().el);
  },
  
  portfolio: function () {
    $('body').html(application.portfolioView.render().el);
  },
  
  preferences: function () {
    $('body').html(application.preferencesView.render().el);
  },
  
  accountSettings: function () {
    $('body').html(application.accountSettingsView.render().el);
  }
});
