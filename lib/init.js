#!/usr/bin/env node
const path = require('path')
const fs = require('fs-extra')
const shell = require('shelljs')
const async = require('async')
const chalk = require('chalk')
const f = require('./helpers.js')
const contents = '"#!/bin/bash\nideablock-commit run "'
const contentsConf = 'echo ' + contents + '>> ' + path.join(process.cwd(), '.ideablock', 'post-commit')
const contentsHooks = 'echo ' + contents + '>> ' + path.join(process.cwd(), '.git', 'hooks', 'post-commit')
const log = console.log

function addIgnoreLine (callback) {
  fs.ensureFile(path.join(process.cwd(), '.gitignore'))
    .then(() => {
      shell.exec('> .gitignore && echo "\n.ideablock" >> .gitignore', { silent: true }, function (code, out, err) {
        callback(null)
      })
    })
}

function createDotIdeaBlock (callback) {
  fs.ensureFile(path.join(process.cwd(), '.ideablock', 'ideablock.json'))
    .then(() => fs.writeJson(path.join(process.cwd(), '.ideablock', 'ideablock.json'), { on: true }))
    .then(() => fs.ensureFile(path.join(process.cwd(), '.ideablock', 'post-commit')))
    .then(() => {
      shell.exec(contentsConf, function (c, o, e) {
        fs.chmodSync(path.join(process.cwd(), '.ideablock', 'post-commit'), 0o744)
        callback(null)
      })
    })
    .catch((err) => log(err))
}

const createHook = function (err, results) {
  if (err) log(err)
  fs.ensureFile(path.join(process.cwd(), '.git', 'hooks', 'post-commit'))
    .then(() => {
      shell.exec(contentsHooks, function (c, o, e) {
        fs.chmodSync(path.join(process.cwd(), '.git', 'hooks', 'post-commit'), 0o744)
        log(chalk.green.bold('\n\t✅ IdeaBlock Commit has been initialized for the git repository in the current directory.\n'))
        process.exit(0)
      })
    })
    .catch((err) => log(err))
}

module.exports.init = function () {
  if (!f.isRepo()) {
    log('\n\t❗ ' + chalk.bold('The present directory is not a git repository.'))
    log('\t   Please initialize a git repository in this directory before invoking ideablock-commit.\n')
  } else if ((f.isRepo() && !f.exists(path.join(process.cwd(), '.ideablock')))) {
    async.series([addIgnoreLine, createDotIdeaBlock], createHook)
  } else if (f.isRepo() && f.isOn()) {
    log(chalk.green.bold('\n\t✅ IdeaBlock Commit is initialized for the git repository in the current directory.\n'))
  } else if (f.isRepo() && f.isOff()) {
    createHook()
    fs.writeJsonSync(path.join(process.cwd(), '.ideablock', 'ideablock.json'), { on: true })
  }
}
