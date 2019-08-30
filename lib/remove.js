#!/usr/bin/env node
const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const f = require('./helpers.js')
const confFile = path.join(process.cwd(), '.ideablock', 'ideablock.json')
const confHook = path.join(process.cwd(), '.ideablock', 'post-commit')
const gitHook = path.join(process.cwd(), '.git', 'hooks', 'post-commit')
const log = console.log

module.exports.remove = function () {
  if (!f.isRepo()) {
    log('\n\t❗ IdeaBlock Commit: The current directory is not a git repository.')
    log('\tPlease initialize a git repository in the present directory or change to the root of a git repository.\n')
  } else if (!(f.exists(confFile) && f.exists(confHook))) {
    log('\n\t❗ IdeaBlock Commit has not yet been initialized in this repository.')
    log('\tPlease run "ideablock-commit init" in the current directory before invoking the "off" function.\n')
  } else if (f.exists(confFile) || f.exists(gitHook)) {
    fs.removeSync(path.join(process.cwd(), '.ideablock'))
    fs.removeSync(gitHook)
    log('\n\t🗑️  ' + chalk.bold('IdeaBlock Commit has been removed from the current repository.\n'))
  }
}
