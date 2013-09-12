var expect = require('chai').expect
  , fs = require('fs')
  , path = require('path')
  , exec = require('child_process').exec
  , rimraf = require('rimraf')
  , mktmpdir = require('mktmpdir');


describe('bin/hooks/hook', function() {
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
      exec('git init', {cwd: path}, function(err) {
        if (err) return done(err);
        exec('git config user.email "foo@example.com"', {cwd: path}, function(err) {
          if (err) return done(err);
          exec('git config user.name "Foo"', {cwd: path}, function(err) {
            if (err) return done(err);
            exec('git-scripts install', {cwd: path}, done);
          });
        });
      });
    });
  });

  afterEach(function(done) {
    rimraf(this.path, done);
  });

  it('shoud be executed', function(done) {
    var pkg = {git: {scripts: {'pre-commit': 'echo "[Executed]" && exit 1'}}};
    var self = this;

    fs.writeFileSync(this.path + '/package.json', JSON.stringify(pkg));
    exec('git add package.json', {cwd: this.path}, function(err) {
      if (err) return done(err);

      exec('git commit -m "test commit"', {cwd: self.path}, function(err, stdout, stderr) {
        expect(err).to.be.an.instanceof(Error);
        expect(stderr).to.contain('[Executed]');
        expect(stderr).to.contain('pre-commit');
        done();
      });
    });
  });
});
