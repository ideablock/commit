#!/usr/bin/env node
const shell = require('shelljs')
const run = require('./run.js')
const chalk = require('chalk')

module.exports.status = function () {
  if (run.isOn() === undefined) console.log('IdeaBlock Commit is currently ' + chalk.bold.red('UNINITIALIZED') + ' in this directory.\nPlease run "ideablock-commit init"')
  else if (run.isOn()) console.log('IdeaBlock Commit is currently ' + chalk.bold.red('INITIALIZED ') + 'and ' + chalk.bold.red('ON') + ' in this repository.')
  else if (run.isOff()) console.log('IdeaBlock Commit is currently ' + chalk.bold.red('INITIALIZED ') + 'and ' + chalk.bold.red('OFF') + ' in this repository.')
}
