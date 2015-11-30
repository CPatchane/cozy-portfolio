var americano, clientPath, config, fs, path, useBuildView;

americano = require('americano');

fs = require('fs');

path = require('path');

clientPath = path.resolve(__dirname, '..', 'client', 'public');

useBuildView = fs.existsSync(path.resolve(__dirname, 'views', 'index.js'));

config = {
  common: {
    set: {
      'view engine': useBuildView ? 'js' : 'jade',
      'views': path.resolve(__dirname, 'views')
    },
    engine: {
      js: function(path, locales, callback) {
        return callback(null, require(path)(locales));
      }
    },
    use: [
      americano.bodyParser(), americano.methodOverride(), americano.errorHandler({
        dumpExceptions: true,
        showStack: true
      }), americano["static"](clientPath, {
        maxAge: 86400000
      })
    ]
  },
  development: [americano.logger('dev')],
  production: [americano.logger('short')],
  plugins: ['americano-cozy']
};

module.exports = config;