#!/usr/bin/env node
const pathExists = require('path-exists')
const fs = require('fs-extra')
const path = require('path')
const confFile = path.join(process.cwd(), '.ideablock', 'ideablock.json')

module.exports.exists = function (path) {
  return pathExists.sync(path)
}

module.exports.isRepo = function () {
  return this.exists(path.join(process.cwd(), '.git'))
}

module.exports.isOn = function () {
  if (this.exists(path.join(confFile))) {
    return fs.readJsonSync(confFile).on
  } else {
    console.log('\n\t❗ IdeaBlock Commit has not yet been initialized in this repository.')
    console.log('\tPlease run "ideablock-commit init" in the current directory before invoking the "on" function.\n')
  }
}

module.exports.isOff = function () {
  if (this.exists(path.join(confFile))) {
    return fs.readJsonSync(confFile).on
  } else {
    console.log('\n\t❗ IdeaBlock Commit has not yet been initialized in this repository.')
    console.log('\tPlease run "ideablock-commit init" in the current directory before invoking the "on" function.\n')
  }
}
