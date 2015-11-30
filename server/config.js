var americano = require('americano');
var jade = require('jade').__express;

var config = {
  common: [
    americano.bodyParser(),
    americano.methodOverride(),
    americano.errorHandler({ dumpExceptions: true, showStack: true}),
    americano.static(__dirname + '/../client/public', {maxAge: 86400000}),
    americano().set('views', __dirname + '/../client/app'),
    americano().engine('.html', jade)
  ],
  development: [
    americano.logger('dev')
  ],
  production: [
    americano.logger('short')
  ],
  plugins: [
    'cozydb'
  ]
};

module.exports = config;