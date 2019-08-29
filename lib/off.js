#!/usr/bin/env node
const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const f = require('./helpers.js')
const confFile = path.join(process.cwd(), '.ideablock', 'ideablock.json')
const confHook = path.join(process.cwd(), '.ideablock', 'post-commit')
const gitHook = path.join(process.cwd(), '.git', 'hooks', 'post-commit')
const log = console.log

module.exports.off = function () {
  if (!f.isRepo()) {
    log('\nThe current directory is not a git repository.')
    log('Please initiate a git repository in the present directory or change to the root of a git repository.\n')
  } else if (!(f.exists(confFile) && f.exists(gitHook) && f.exists(confHook))) {
    log('IdeaBlock Commit has not yet been initiated in this repository.')
    log('Please run "ideablock-commit init" in the current directory before invoking the "off" function.')
  } else if (f.isOff()) {
    log('\nIdeaBlock Commit is currently set to ' + chalk.bold.red('OFF') + ' in this repository.\n')
  } else if (f.isOn()) {
    fs.writeJSON(confFile, { on: false })
      .then(() => fs.remove(gitHook))
      .then(() => log('\nIdeaBlock Commit has been set to ' + chalk.bold.red('OFF') + ' in this repository.\n'))
      .catch((err) => console.log(err))
  }
}
