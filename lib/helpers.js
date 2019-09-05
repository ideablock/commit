#!/usr/bin/env node
const pathExists = require('path-exists')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const confFile = path.join(process.cwd(), '.ideablock', 'ideablock.json')
const authFile = path.join(os.homedir(), '.ideablock', 'auth.json')

module.exports.exists = function (path) {
  return pathExists.sync(path)
}

module.exports.isRepo = function () {
  return this.exists(path.join(process.cwd(), '.git'))
}

module.exports.isOn = function () {
  if (this.exists(path.join(confFile))) {
    return fs.readJsonSync(confFile).on
  }
}

module.exports.isOff = function () {
  if (this.exists(path.join(confFile))) {
    return !fs.readJsonSync(confFile).on
  }
}

module.exports.isInit = function () {
  return this.exists(confFile)
}

module.exports.authed = function () {
  return this.exists(authFile)
}

