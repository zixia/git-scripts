var os = require('os')
  , fs = require('fs')
  , crypto = require('crypto');


exports.mktmpdir = function(callback) {
  // Node v0.8 doesn't support os.tmpdir
  var path = os.tmpDir() + '/' + crypto.randomBytes(20).toString('hex');

  fs.mkdir(path, 0700, function(err) {
    callback(err, path);
  });
}

