
var debug = true;

var mongo_url;

if (debug) {
  mongo_url = 'mongodb://localhost/test';
} else {

}

module.exports.mongo_url = mongo_url;
