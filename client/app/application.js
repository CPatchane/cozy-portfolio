// Application bootstrapper.
var Application = {
  initialize: function () {
    var Router = require('./lib/router');
    var HomeView = require('./views/home_view');
    var ChoicesView = require('./views/choices_view');
    var AccountSettingsView = require('./views/accountSettings_view');
    // Ideally, initialized classes should be kept in controllers & mediator.
    // If you're making big webapp, here's more sophisticated skeleton
    // https://github.com/paulmillr/brunch-with-chaplin
    //we initialize all views of the application
    this.homeView = new HomeView();
    this.choicesView = new ChoicesView();
    this.accountSettingsView = new AccountSettingsView();
    //and the router
    this.router = new Router();
    if (typeof Object.freeze === 'function') {
      Object.freeze(this);
    }
  }
};

module.exports = Application;
