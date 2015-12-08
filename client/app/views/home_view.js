var View = require('./view');
var template = require('./templates/home.jade');

module.exports = View.extend({
  id: 'portfolio',
  template: template
});
