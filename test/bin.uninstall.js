var expect = require('chai').expect
  , util = require('util')
  , fs = require('fs')
  , path = require('path')
  , exec = require('child_process').exec
  , rimraf = require('rimraf')
  , mktmpdir = require('mktmpdir');


describe('bin/uninstall', function() {
  this.timeout(5000);

  beforeEach(function(done) {
    var self = this;
    mktmpdir(function(err, path) {
      if (err) return done(err);

      self.path = path;
      exec('git init', {cwd: path}, function(err) {
        if (err) return done(err);

        fs.mkdir(path + '/node_modules', function(err) {
          if (err) return done(err);

          var cmd = util.format('cp -a %s %s',
                __dirname + '/..', path + '/node_modules/git-scripts');
          exec(cmd, function(err) {
            if (err) return done(err);

            exec(path + '/node_modules/git-scripts/bin/install', done);
          });
        });
      });
    });
  });

  afterEach(function(done) {
    rimraf(this.path, done);
  });

  it('should restore `.git/hooks`', function(done) {
    var self = this;
    exec(this.path + '/node_modules/git-scripts/bin/uninstall', function(err, stdout, stderr) {
      var stat = fs.lstatSync(self.path + '/.git/hooks');
      expect(stat.isSymbolicLink()).to.be.false;
      expect(fs.existsSync(self.path + '/.git/hooks.old')).to.be.false;
      done(err);
    });
  });
});
