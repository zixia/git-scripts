var expect = require('chai').expect
  , util = require('util')
  , fs = require('fs')
  , path = require('path')
  , exec = require('child_process').exec
  , rimraf = require('rimraf')
  , mktmpdir = require('mktmpdir');


describe('bin/install', function() {
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
          exec(cmd, done);
        });
      });
    });
  });

  afterEach(function(done) {
    rimraf(this.path, done);
  });

  it('should replace `.git/hooks`', function(done) {
    var self = this;
    exec(this.path + '/node_modules/git-scripts/bin/install', function(err, stdout, stderr) {
      var gitPath = self.path + '/.git'
        , binHooksPath = path.resolve(gitPath, fs.readlinkSync(gitPath + '/hooks'));

      expect(binHooksPath).to.equal(path.normalize(self.path + '/node_modules/git-scripts/bin/hooks'));
      expect(fs.existsSync(self.path + '/.git/hooks.old')).to.be.true;
      done(err);
    });
  });
});
