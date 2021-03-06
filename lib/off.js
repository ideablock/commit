#!/usr/bin/env node
const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const f = require('./helpers.js')
const confFile = path.join(process.cwd(), '.ideablock', 'ideablock.json')
const gitHook = path.join(process.cwd(), '.git', 'hooks', 'post-commit')
const log = console.log

module.exports.off = function () {
  if (!f.isRepo()) {
    log('\n\t❗ IdeaBlock Commit: The current directory is not a git repository.')
    log('\t   Please initialize a git repository in the present directory or change to the root of a git repository.\n')
  } else if (!(f.exists(confFile))) {
    log('\n\t❗ IdeaBlock Commit has not yet been initialized in this repository.')
    log('\t   Please run "ideablock-commit init" in the current directory before invoking the "off" function.\n')
  } else if (f.isOff()) {
    log('\n\t❌ IdeaBlock Commit is currently set to ' + chalk.bold.red('OFF') + ' in this repository.\n')
  } else if (f.isOn()) {
    fs.writeJsonSync(confFile, { on: false })
    fs.removeSync(gitHook)
    log('\n\t❌ IdeaBlock Commit has been set to ' + chalk.bold.red('OFF') + ' in this repository.\n')
  }
}
