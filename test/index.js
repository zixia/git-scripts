var expect = require('chai').expect
  , fs = require('fs')
  , path = require('path')
  , exec = require('child_process').exec
  , rimraf = require('rimraf')
  , mktmpdir = require('mktmpdir')
  , scripts = require('../');


describe('git-scripts', function() {
  beforeEach(function(done) {
    var self = this;
    mktmpdir(function(err, dir) {
      self.proj = scripts(dir);
      done(err);
    });
  });

  afterEach(function(done) {
    rimraf(this.proj.path, done);
  });

  describe('when the path is not a git repo', function() {
    describe('isGitRepo()', function() {
      it('should be false', function(done) {
        this.proj.isGitRepo(function(result) {
          expect(result).to.be.false;
          done();
        });
      });
    });

    describe('installed()', function() {
      it('should be false', function(done) {
        this.proj.installed(function(result) {
          expect(result).to.be.false;
          done();
        });
      });
    });

    describe('install()', function() {
      it('should be an error', function(done) {
        this.proj.install(function(err) {
          expect(err).to.be.an.instanceof(Error);
          done();
        });
      });
    });

    describe('uninstall()', function() {
      it('should be an error', function(done) {
        this.proj.uninstall(function(err) {
          expect(err).to.be.an.instanceof(Error);
          done();
        });
      });
    });
  });

  describe('when the path is a git repo', function() {
    beforeEach(function(done) {
      exec('git init', {cwd: this.proj.path}, done);
    });

    describe('isGitRepo()', function() {
      it('should be true', function(done) {
        this.proj.isGitRepo(function(result) {
          expect(result).to.be.true;
          done();
        });
      });
    });

    describe('installed()', function() {
      it('should be false', function(done) {
        this.proj.installed(function(result) {
          expect(result).to.be.false;
          done();
        });
      });
    });

    describe('install()', function() {
      it('should move the old hooks directory and create the new symlink', function(done) {
        var self = this;
        this.proj.install(function(err) {
          var gitPath = self.proj.path + '/.git'
            , binHooksPath = path.resolve(gitPath, fs.readlinkSync(gitPath + '/hooks'));

          expect(binHooksPath).to.equal(path.normalize(__dirname + '/../bin/hooks'));
          expect(fs.existsSync(self.proj.path + '/.git/hooks.old')).to.be.true;
          done(err);
        });
      });

      it('should work if no hooks directory exist', function(done) {
        var hooksPath = this.proj.path + '/.git/hooks';
        var self = this;

        rimraf(hooksPath, function(err) {
          if (err) throw err;
          self.proj.install(done);
        });
      });
    });

    describe('uninstall()', function() {
      it('should be an error', function(done) {
        this.proj.uninstall(function(err) {
          expect(err).to.be.an.instanceof(Error);
          done();
        });
      });
    });
  });

  describe('when the gitdir is specified in a text file', function() {
    beforeEach(function(done) {
      var self = this;
      mktmpdir(function(err, dir) {
        function setupProj() {
          exec('git init', {cwd: dir}, moveGitDir);
        }
        function moveGitDir() {
           exec('mv .git .git2', {cwd: dir}, createGitFile);
        }
        function createGitFile() {
          exec('echo "gitdir: ./.git2" > .git', {cwd: dir}, updateProj);
        }
        function updateProj() {
          self.proj = scripts(dir);
          done(err);
        }

        setupProj();
      });
    });

    describe('isGitRepo()', function() {
      it('should be true', function(done) {
        this.proj.isGitRepo(function(result) {
          expect(result).to.be.true;
          done();
        });
      });
    });

    describe('installed()', function() {
      it('should be false', function(done) {
        this.proj.installed(function(result) {
          expect(result).to.be.false;
          done();
        });
      });
    });

    describe('install()', function() {
      it('should move the old hooks directory and create the new symlink', function(done) {
        var self = this;
        this.proj.install(function(err) {
          var gitPath = self.proj.gitPath
            , binHooksPath = path.resolve(gitPath, fs.readlinkSync(gitPath + '/hooks'));

          expect(binHooksPath).to.equal(path.normalize(__dirname + '/../bin/hooks'));
          expect(fs.existsSync(gitPath + '/hooks.old')).to.be.true;
          done(err);
        });
      });

      it('should work if no hooks directory exist', function(done) {
        var hooksPath = this.proj.path + '/hooks';
        var self = this;

        rimraf(hooksPath, function(err) {
          if (err) throw err;
          self.proj.install(done);
        });
      });
    });

    describe('uninstall()', function() {
      it('should be an error', function(done) {
        this.proj.uninstall(function(err) {
          expect(err).to.be.an.instanceof(Error);
          done();
        });
      });
    });
  });

  describe('when installed', function() {
    beforeEach(function(done) {
      var self = this;
      exec('git init', {cwd: this.proj.path}, function(err) {
        if (err) return done(err);
        self.proj.install(done);
      });
    });

    describe('installed()', function() {
      it('should be true', function(done) {
        this.proj.installed(function(result) {
          expect(result).to.be.true;
          done();
        });
      });
    });

    describe('install()', function() {
      it('should be an error', function(done) {
        this.proj.install(function(err) {
          expect(err).to.be.an.instanceof(Error);
          done();
        });
      });
    });

    describe('uninstall()', function() {
      it('should delete the symlink and move old hooks directory', function(done) {
        var self = this;
        this.proj.uninstall(function(err) {
          expect(fs.existsSync(self.proj.path + '/.git/hooks')).to.be.true;
          expect(fs.existsSync(self.proj.path + '/.git/hooks.old')).to.be.false;
          done(err);
        });
      });
    });
  });

  describe('when the path has no package.json', function() {
    describe('readCommand()', function() {
      it('should be an error', function(done) {
        this.proj.readCommand('foo', function(err, cmd) {
          expect(err).to.be.an.instanceof(Error);
          expect(cmd).to.not.exist;
          done();
        });
      });
    });

    describe('run()', function() {
      it('should be an error', function(done) {
        this.proj.run('foo', function(err) {
          expect(err).to.be.an.instanceof(Error);
          done();
        });
      });
    });
  });

  describe('when the path has package.json', function() {
    beforeEach(function(done) {
      var pkg = {git: {scripts: {
        foo: 'echo "hello, $1"',
        bar: 'exit 1'
      }}};
      fs.writeFile(this.proj.path + '/package.json', JSON.stringify(pkg), done);
    });

    describe('readCommand()', function() {
      it('should parse command', function(done) {
        this.proj.readCommand('foo', function(err, cmd) {
          expect(err).to.not.exist;
          expect(cmd).to.equal('echo "hello, $1"');
          done();
        });
      });

      it('should not be error when the command does not exist', function(done) {
        this.proj.readCommand('any', function(err, cmd) {
          expect(err).to.not.exist;
          expect(cmd).to.not.exist;
          done();
        });
      });
    });

    describe('run()', function() {
      it('should be able to supply arguments', function(done) {
        this.proj.run('foo', ['world'], done);
      });

      it('should be an error when the command failed', function(done) {
        this.proj.run('bar', function(err) {
          expect(err).to.be.an.instanceof(Error);
          expect(err).to.have.property('code', 1);
          done();
        });
      });

      it('should not be an error when the command does not exist', function(done) {
        this.proj.run('any', function(err) {
          expect(err).to.not.exist;
          done();
        });
      });
    });
  });
});
