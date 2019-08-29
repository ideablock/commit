#!/usr/bin/env node
const path = require('path')
const chalk = require('chalk')
const f = require('./helpers.js')
const confFile = path.join(process.cwd(), '.ideablock', 'ideablock.json')
const confHook = path.join(process.cwd(), '.ideablock', 'post-commit')
const gitHook = path.join(process.cwd(), '.git', 'hooks', 'post-commit')
const log = console.log

module.exports.status = function () {
  if (!(f.exists(confFile) && f.exists(gitHook) && f.exists(confHook))) {
    log(chalk.bold.black('\n\t❗ IdeaBlock Commit is currently ') + chalk.bold.red('UNINITIALIZED') + chalk.bold.black(' in this directory.\nPlease run the "init" function in this directory to initialize IdeaBlock Commit.\n'))
  } else if (!f.isRepo()) {
    log('\n\t❗ IdeaBlock Commit: The current directory is not a git repository.')
    log('\tPlease initialize a git repository in the present directory or change to the root of a git repository.\n')
  } else if (f.isRepo() && f.isOn()) {
    log('\n\tIdeaBlock Commit is currently ' + chalk.bold.red('INITIALIZED ') + 'and ' + chalk.bold.red('ON') + ' in this repository.\n')
  } else if (f.isRepo() && f.isOff()) {
    log('\n\tIdeaBlock Commit is currently ' + chalk.bold.red('INITIALIZED ') + 'and ' + chalk.bold.red('OFF') + ' in this repository.\n')
  }
}
