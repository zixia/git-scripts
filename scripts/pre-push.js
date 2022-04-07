#!/usr/bin/env node
/**
 *
 * An example hook script to verify what is about to be committed.
 * Called by "git commit" with no arguments.  The hook should
 * exit with non-zero status after issuing an appropriate message if
 * it wants to stop the commit.
 *
 * To enable this hook, rename this file to "pre-commit".
 *
 */
const shell = require('shelljs')

const NO_HOOK_VAR = 'NO_HOOK'
const INNER_PRE_HOOK = 'CHATIE_INNER_PRE_HOOK'

const argv = process.argv.slice(2)
const remoteName = argv[0] || ''
const remoteUrl = argv[1] || ''
const refs = []

for (let i = 2; i + 4 <= argv.length;) {
  const ref = {
    localBranch : argv[i++] || '',
    localCommit : argv[i++] || '',
    remoteBranch : argv[i++] || '',
    remoteCommit : argv[i++] || '',
  }
  if (ref.localCommit.match(/^0+$/)) {
    ref.localBranch = ''
  }
  refs.push(ref)
}

if (refs[0] && refs[0].localCommit.match(/^0+$/)) {
  // delete remote branch
  process.exit(0)
}

if (process.env[NO_HOOK_VAR]) {
  // user set NO_HOOK=1 to prevent this hook works
  process.exit(0)
}

if (process.env[INNER_PRE_HOOK]) {
  // http://stackoverflow.com/a/21334985/1123955
  process.exit(0)
}

const packageVersion = require('../package.json').version
const lastCommitMsg = shell.exec('git log --pretty=format:"%s" HEAD^0 -1', {silent: true}).stdout

if (packageVersion === lastCommitMsg) {
  process.exit(0)
}

shell.rm('-f', 'package-lock.json')
shell.exec('npm version patch --no-package-lock').code === 0 || process.exit(1)
process.env[INNER_PRE_HOOK] = '1'

const refMaps = refs.map(ref => ref.remoteBranch ? ref.localBranch + ':' + ref.remoteBranch : '')
const cmd = ['git push', remoteName, ...refMaps].join(' ')
shell.exec(cmd).code === 0 || process.exit(1)

console.info(String.raw`
____ _ _        ____            _
/ ___(_) |_     |  _ \ _   _ ___| |__
| |  _| | __|    | |_) | | | / __| '_ \
| |_| | | |_     |  __/| |_| \__ \ | | |
\____|_|\__|    |_|    \__,_|___/_| |_|

____                              _ _
/ ___| _   _  ___ ___ ___  ___  __| | |
\___ \| | | |/ __/ __/ _ \/ _ \/ _^ | |
___) | |_| | (_| (_|  __/  __/ (_| |_|
|____/ \__,_|\___\___\___|\___|\__,_(_)

`)

console.info(`



 ### Npm verion bumped and pushed by inner push inside hook pre-push ###"
 ------- vvvvvvv outer push will be canceled, never mind vvvvvvv -------"


`)

process.exit(1)
