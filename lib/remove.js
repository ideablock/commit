#!/usr/bin/env node
const path = require('path')
const fs = require('fs-extra')
const f = require('./lib/helpers.js')
const confFile = path.join(process.cwd(), '.ideablock', 'ideablock.json')
const gitHook = path.join(process.cwd(), '.ideablock', 'post-commit')
const confHook = path.join(process.cwd(), '.git', 'hooks', 'post-commit')

module.exports.remove = function () {
  if (!f.isRepo()) {
    console.log('\nThe current directory is not a git repository.\nPlease initiate a git repository in the present directory or change to the root of a git repository.\n')
  } else if (!(f.exists(confFile) && f.exists(gitHook) && f.exists(confHook))) {
    log('IdeaBlock Commit has not yet been initiated in this repository.')
    log('Please run "ideablock-commit init" in the current directory before invoking the "off" function.')
  } else if (f.exists(path.join(process.cwd(), '.ideablock'))) {
    fs.removeSync(path.join(process.cwd(), '.ideablock'))
  } else if (f.exists(gitHook)) {
    fs.removeSync(gitHook)
  }
}