#!/usr/bin/env node
const path = require('path')
const fs = require('fs-extra')
const shell = require('shelljs')
const run = require('./run.js')

module.exports.on = function () {
  fs.pathExists(path.join(process.cwd(), '.ideablock', 'ideablock.json'))
    .then((exists) => {
      if (!exists) {
        console.log('IdeaBlock Commit has not yet been initiated in this repository.')
        console.log('Please run "ideablock-commit init" in the current directory before invoking the "on" function.')
      } else if (run.isOn()) {
        console.log('IdeaBlock Commit is already on in this repository.')
      } else if (run.isOff()) {
        shell.exec('> ' + path.join(process.cwd(), '.ideablock', 'ideablock.json'), { silent: true }, function (code, out, err) {
          fs.writeJSON(path.join(process.cwd(), '.ideablock', 'ideablock.json'), { on: true })
            .then(() => fs.copy(path.join(process.cwd(), '.ideablock', 'post-commit'), path.join(process.cwd(), '.ideablock', '.git', 'hooks', 'post-commit')))
        })
      }
    })
}
