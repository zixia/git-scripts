
var fs = require('fs')
  , path = require('path')
  , spawn = require('child_process').spawn;


module.exports = GitScripts;


function GitScripts(path) {
  this.path = path = path || '.';
  this.packagePath = path + '/package.json';
  this.gitPath = path + '/.git';
  this.hooksPath = this.gitPath + '/hooks';
  this.oldHooksPath = this.gitPath + '/hooks.old';
}

/**
 * Install git-scripts.
 *
 * @param {Function} callback
 * @api public
 */

GitScripts.prototype.install = function(callback) {
  callback = callback || function() {};

  var self = this;

  this.isGitRepo(function(result) {
    if (!result) {
      return callback(new Error('Not a git repository.'));
    }

    self.installed(function(result) {
      if (result) {
        return callback(new Error('Already installed.'));
      }

      fs.exists(self.hooksPath, function(exists){
          function linkHooksPath(err) {
            if (err) return callback(err);

            var hooksSrcPath = __dirname + '/../bin/hooks';
            fs.symlink(path.relative(self.gitPath, hooksSrcPath), self.hooksPath, callback);
          }

          if (exists) {
             return fs.rename(self.hooksPath, self.oldHooksPath, linkHooksPath);
          }

          return fs.symlink(self.hooksPath, self.oldHooksPath, linkHooksPath);
      });
    });
  });
};

/**
 * Uninstall git-scripts.
 *
 * @param {Function} callback
 * @api public
 */

GitScripts.prototype.uninstall = function(callback) {
  callback = callback || function() {};

  var self = this;

  this.isGitRepo(function(result) {
    if (!result) {
      return callback(new Error('Not a git repository.'));
    }

    self.installed(function(result) {
      if (!result) {
        return callback(new Error('Not installed.'));
      }

      fs.unlink(self.hooksPath, function(err) {
        if (err) return callback(err);

        fs.rename(self.oldHooksPath, self.hooksPath, callback);
      });
    });
  });
};

/**
 * Run a git-hooks script.
 *
 * @param {String} hook name
 * @param {String} args
 * @param {Function} callback
 * @api public
 */

GitScripts.prototype.run = function(name) {
  var args = Array.prototype.slice.call(arguments)
    , callback = function() {};

  if ('function' == typeof args[args.length - 1]) {
    callback = args.pop();
  }

  this.readCommand(name, function(err, cmd) {
    if (err) return callback(err);
    if (!cmd) return callback();

    var conf = {stdio: 'inherit', customFds: [0, 1, 2]}
      , proc = spawn('sh', ['-c', cmd].concat(args), conf);

    proc.on('close', function(code) {
      var err;
      if (code) {
        err = new Error('Failed to exec ' + name + ' hook script');
        err.code = code;
      }

      callback(err);
    });
  });
};

/**
 * Read the script command.
 *
 * @api private
 */

GitScripts.prototype.readCommand = function(name, callback) {
  fs.readFile(this.packagePath, function(err, data) {
    if (err) return callback(err);

    var pkg = JSON.parse(data)
      , git = pkg.git || {}
      , scripts = git.scripts || {};

    callback(null, scripts[name]);
  });
};

/**
 * @api private
 */

GitScripts.prototype.isGitRepo = function(callback) {
  fs.exists(this.gitPath, callback);
};

/**
 * @api private
 */

GitScripts.prototype.installed = function(callback) {
  fs.exists(this.oldHooksPath, callback);
};
