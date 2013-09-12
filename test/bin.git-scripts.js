var expect = require('chai').expect
  , fs = require('fs')
  , path = require('path')
  , exec = require('child_process').exec
  , rimraf = require('rimraf')
  , mktmpdir = require('mktmpdir');


describe('bin/git-scripts', function() {
  before(function() {
    this.PATH = process.env.PATH;
    process.env.PATH = __dirname + '/../bin:' + process.env.PATH
  });

  after(function() {
    process.env.PATH = this.PATH;
  });

  beforeEach(function(done) {
    var self = this;
    mktmpdir(function(err, path) {
      self.path = path;
      done(err);
    });
  });

  afterEach(function(done) {
    rimraf(this.path, done);
  });

  describe('when the path is not a git repo', function() {
    describe('install', function() {
      it('shoud print a message to stderr', function(done) {
        exec('git-scripts install', {cwd: this.path}, function(err, stdout, stderr) {
          expect(stdout).to.be.empty;
          expect(stderr).to.not.be.empty;
          done(err);
        });
      });
    });

    describe('install <path>', function() {
      it('shoud print a message to stderr', function(done) {
        exec('git-scripts install ' + this.path, function(err, stdout, stderr) {
          expect(stdout).to.be.empty;
          expect(stderr).to.not.be.empty;
          done(err);
        });
      });
    });
  });

  describe('when the path is a git repo', function() {
    beforeEach(function(done) {
      exec('git init', {cwd: this.path}, done);
    });

    describe('install', function() {
      it('should move the old hooks directory and create the new symlink', function(done) {
        var self = this;
        exec('git-scripts install', {cwd: this.path}, function(err, stdout, stderr) {
          var gitPath = self.path + '/.git'
            , binHooksPath = path.resolve(gitPath, fs.readlinkSync(gitPath + '/hooks'));

          expect(binHooksPath).to.equal(path.normalize(__dirname + '/../bin/hooks'));
          expect(fs.existsSync(self.path + '/.git/hooks.old')).to.be.true;
          done(err);
        });
      });
    });

    describe('install <path>', function() {
      it('should move the old hooks directory and create the new symlink', function(done) {
        var self = this;
        exec('git-scripts install ' + this.path, function(err, stdout, stderr) {
          var gitPath = self.path + '/.git'
            , binHooksPath = path.resolve(gitPath, fs.readlinkSync(gitPath + '/hooks'));

          expect(binHooksPath).to.equal(path.normalize(__dirname + '/../bin/hooks'));
          expect(fs.existsSync(self.path + '/.git/hooks.old')).to.be.true;
          done(err);
        });
      });
    });
  });

  describe('when installed', function() {
    beforeEach(function(done) {
      var self = this;
      exec('git init', {cwd: this.path}, function(err) {
        if (err) return done(err);
        exec('git-scripts install', {cwd: self.path}, done);
      });
    });

    describe('install', function() {
      it('shoud exit gracefully ', function(done) {
        exec('git-scripts install', {cwd: this.path}, function(err, stdout, stderr) {
          expect(stdout).to.be.empty;
          expect(stderr).to.be.empty;
          done(err);
        });
      });
    });

    describe('install <path>', function() {
      it('shoud exit gracefully ', function(done) {
        exec('git-scripts install ' + this.path, function(err, stdout, stderr) {
          expect(stdout).to.be.empty;
          expect(stderr).to.be.empty;
          done(err);
        });
      });
    });
  });
});
