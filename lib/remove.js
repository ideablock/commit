#!/usr/bin/env node
const path = require('path')
const fs = require('fs-extra')

module.exports.remove = function () {
  fs.pathExists(path.join(process.cwd(), '.ideablock'))
    .then((exists) => fs.remove(path.join(process.cwd(), '.ideablock')))
    .then(fs.pathExists(path.join(process.cwd(), '.git', 'hooks', 'post-commit')))
    .then((exists) => fs.remove(path.join(process.cwd(), '.git', 'hooks', 'post-commit')))
}