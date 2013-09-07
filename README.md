git-scripts
==================
[![Build Status](https://travis-ci.org/nkzawa/git-scripts.png?branch=master)](https://travis-ci.org/nkzawa/git-scripts)

Manage [git hooks](http://git-scm.com/book/en/Customizing-Git-Git-Hooks) with the "git.scripts" field of the package.json like [npm-scripts](https://npmjs.org/doc/scripts.html).

```json
{
  "git": {
    "scripts": {
      "pre-commit": "npm test",
      "post-merge": "npm install"
    }
  }
}
```

## Installation
    $ npm install git-scripts

NOTE: `.git/hooks` of your project is replaced when installed. You can restore it by uninstalling the module.

## Description
git-scripts supports all hooks including the following:

* applypatch-msg
* pre-applypatch
* post-applypatch
* pre-commit
* prepare-commit-msg
* commit-msg
* post-commit
* pre-rebase
* post-checkout
* post-merge
* pre-receive
* update
* post-receive
* post-update
* pre-auto-gc
* post-rewrite

## CLI
    $ npm install -g git-scripts

```
Usage: git-scripts <command> [options]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

  Commands:

    install [path]           install git-scripts
    uninstall [path]         uninstall git-scripts
    run <name> [args ...]    run arbitrary scripts
```

NOTE: Usually, you don't need CLI. Hooks are enabled automatically when you install the module locally.

## Using Programmatically
If you would like to use git-scripts programmatically, you can do that.

```js
var scripts = require('git-scripts');
var project = scripts('somewhere/yourproject');

project.install(function(err) {
  if (err) throw err;
  console.log('git-scripts was installed.');

  project.run('pre-commit', function(err) {
    if (err) throw err;
    console.log('pre-commit script succeeded.');
  });
});
```

### Documentation
```js
var scripts = require('git-scripts');
var project = scripts('somewhere/yourproject');
```

#### scripts([path])
Create a git-scripts instance for `path`.

#### project.install([callback])
Install git-scripts.

#### project.uninstall([callback])
Uninstall git-scripts.

#### project.run(name, [args ...], [callback])
Run arbitrary script of `name`.

## License
MIT
