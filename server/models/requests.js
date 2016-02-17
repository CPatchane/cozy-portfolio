// See documentation on https://github.com/cozy/cozy-db

var cozydb = require('cozydb');

module.exports = {
  accounts: {
    // shortcut for emit doc._id, doc
    all: cozydb.defaultRequests.all,

    /* create all the requests you want!
    This request will gives you the number of documents that share
    the same date */
    /*customRequest: {
      map: function (doc) {
        return emit(doc.date, doc);
      },
      reduce: function (key, values, rereduce) {
        return sum(values);
      }
    }*/
  },
  
  user: {
    all: cozydb.defaultRequests.all,
  },
  
  portfolioDocument: {
    all: cozydb.defaultRequests.all,
    bySource: cozydb.defaultRequests.by('source')
  },
  
  badgesGroup: {
    all: cozydb.defaultRequests.all,
  }
};
