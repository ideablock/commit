#!/usr/bin/env node
const path = require('path')
const fs = require('fs-extra')
const shell = require('shelljs')
const async = require('async')

function isRepo () {
  fs.pathExists(path.join(process.cwd(), '.git'))
    .then((exists) => {
      if (exists) return true
      else return false
    })
}

function addIgnoreLine (callback) {
  fs.ensureFile(path.join(process.cwd(), '.gitignore'))
    .then(() => {
      shell.exec('echo "\n.ideablock" >> .gitignore', { silent: true }, function (code, out, err) {
        callback(null)
      })
    })
}

function createDotIdeaBlock (callback) {
  fs.ensureFile(path.join(process.cwd(), '.ideablock', 'ideablock.json'))
    .then(() => {
      fs.writeJSON(path.join(process.cwd(), '.ideablock', 'ideablock.json'), { on: true })
        .then(() => callback(null))
    })
    .catch((err) => console.log(err))
}

const createHook = function (err, results) {
  if (err) console.log(err)
  fs.copy('./post-commit', path.join(process.cwd(), '.git', 'hooks', 'post-commit'))
    .then(() => fs.chmod('u+x', path.join(process.cwd(), '.git', 'hooks', 'post-commit')))
    .then(() => fs.copy(('./post-commit', path.join(process.cwd(), '.ideablock', 'post-commit'))))
    .then(() => fs.chmod('u+x', path.join(process.cwd(), '.ideablock', 'post-commit')))
    .then(() => process.exit(0))
    .catch((error) => console.log(error))
}

module.exports.init = function () {
  if (isRepo()) {
    fs.pathExists(path.join(process.cwd(), '.ideablock'))
      .then((exists) => {
        if (exists) console.log('Re-initializing existing IdeaBlock Commit in current directory.')
        async.series([addIgnoreLine, createDotIdeaBlock], createHook)
      })
  } else {
    console.log('The present directory is not a git repository.')
    console.log('Please initialize a git repository in this directory before invoking ideablock-commit')
  }
}
