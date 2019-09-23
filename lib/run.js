#!/usr/bin/env node

const path = require('path')
const crypto = require('crypto')
const shell = require('shelljs')
const fs = require('fs-extra')
const async = require('async')
const FormData = require('form-data')
const fetch = require('node-fetch')
const os = require('os')
const Table = require('cli-table2')
const chalk = require('chalk')
const Ora = require('ora')
const f = require('./helpers.js')
const ideaBlockURL = 'https://beta.ideablock.io/cli/create-idea-silent'
const log = console.log
let jsonAuthContents = {}
const repoName = path.basename(process.cwd())
const repoSaveDir = path.join(os.homedir(), '.ideablock', 'commits', repoName)
const desiredMode = 0o2775
const spinUp = {
  interval: 150,
  frames: [
    '🖥️💡------------------------------⛓️',
    '🖥️-💡-----------------------------⛓️',
    '🖥️--💡----------------------------⛓️',
    '🖥️---💡---------------------------⛓️',
    '🖥️----💡--------------------------⛓️',
    '🖥️-----💡-------------------------⛓️',
    '🖥️------💡------------------------⛓️',
    '🖥️-------💡-----------------------⛓️',
    '🖥️--------💡----------------------⛓️',
    '🖥️---------💡---------------------⛓️',
    '🖥️----------💡--------------------⛓️',
    '🖥️-----------💡-------------------⛓️',
    '🖥️------------💡------------------⛓️',
    '🖥️-------------💡-----------------⛓️',
    '🖥️--------------💡----------------⛓️',
    '🖥️---------------💡---------------⛓️',
    '🖥️----------------💡--------------⛓️',
    '🖥️-----------------💡-------------⛓️',
    '🖥️------------------💡------------⛓️',
    '🖥️-------------------💡-----------⛓️',
    '🖥️--------------------💡----------⛓️',
    '🖥️---------------------💡---------⛓️',
    '🖥️----------------------💡--------⛓️',
    '🖥️-----------------------💡-------⛓️',
    '🖥️------------------------💡------⛓️',
    '🖥️-------------------------💡-----⛓️',
    '🖥️--------------------------💡----⛓️',
    '🖥️---------------------------💡---⛓️',
    '🖥️----------------------------💡--⛓️',
    '🖥️-----------------------------💡-⛓️',
    '🖥️------------------------------💡⛓️',
    '🖥️--------------------------------💡',
    '🖥️--------------------------------💡',
    '🖥️--------------------------------💡',
    '🖥️--------------------------------💡',
    '🖥️--------------------------------💡',
    '🖥️--------------------------------💡'
  ]
}

// Subroutines

function getParity () {
  return Math.floor(Math.random() * Math.floor(10))
}

// FUNCTIONS FOR ASYNC

function authorize (callback) {
  fs.pathExists(path.join(os.homedir(), '.ideablock', 'auth.json'), (err, exists) => {
    if (err) log(err)
    if (exists) {
      fs.readJson(path.join(os.homedir(), '.ideablock', 'auth.json'))
        .then((obj) => {
          jsonAuthContents = obj
          callback(null, jsonAuthContents.auth)
        })
    }
  })
}

// Get short hash
function getShortHash (apiToken, callback) {
  shell.exec('git log -1 --pretty=format:%h', { silent: true }, function (code, stdout, stderr) {
    const shortHash = stdout
    callback(null, shortHash, apiToken)
  })
}

// Zip array of files
function ideaZip (shortHash, apiToken, callback) {
  const commitSaveDir = path.join(repoSaveDir, shortHash)
  const zipFile = path.join(commitSaveDir, 'Commit-' + shortHash + '.zip')
  fs.ensureDir(commitSaveDir, desiredMode)
    .then(() => {
      shell.exec('git archive -o ' + zipFile + ' HEAD', function (code, stdout, stderr) {
        callback(null, zipFile, shortHash, apiToken)
      })
    })
    .catch((err) => log(err))
}

// Hash Idea File
function hashRepo (zipFile, shortHash, apiToken, callback) {
  const shasum = crypto.createHash('sha256')
  const s = fs.ReadStream(zipFile)
  s.on('data', function (d) { shasum.update(d) })
  s.on('end', function () {
    const repoHash = shasum.digest('hex')
    callback(null, repoHash, shortHash, apiToken)
  })
}

function sendOut (repoHash, shortHash, apiToken, callback) {
  const parity = getParity()
  const spinner = new Ora({
    spinner: spinUp,
    indent: 5
  })
  spinner.start('  Tethering Commit to Blockchains')
  const hash = shortHash + repoHash + parity
  const commitData = path.join(os.homedir(), '.ideablock', 'commits', repoName, shortHash, 'commitData.json')
  const commitJSON = {}
  commitJSON.hash = hash
  commitJSON.api_token = apiToken
  fs.writeJson(commitData, commitJSON, err => {
    if (err) log(err)
    const formData = new FormData()
    formData.append('file', fs.createReadStream(commitData))
    const options = {
      method: 'POST',
      body: formData
    }
    fetch(ideaBlockURL, options)
      .then(res => res.json())
      .then(json => {
        spinner.stop()
        const output = JSON.parse(json)
        log('\n\t✅ Congratulations! Your commit has been successfully tethered using IdeaBlock!\n')
        const commitObj = {
          shortHash: shortHash,
          repoHash: repoHash,
          parityByte: parity,
          fullHash: hash,
          BTC: output.BTC,
          LTC: output.LTC,
          authToken: apiToken
        }
        fs.writeJSON(path.join(repoSaveDir, shortHash, 'commitData.json'), commitObj)
          .then(() => {
            const commitSaveDir = path.join(repoSaveDir, shortHash)
            const table = new Table({ style: { head: [], border: [] } })
            table.push(
              [{ colSpan: 2, content: chalk.bold.rgb(242, 24, 0)('Commit Information:') }],
              [chalk.yellow('Bitcoin Hash: '), commitObj.BTC],
              [chalk.gray('Litecoin Hash: '), commitObj.LTC],
              [chalk.white('Commit Short Hash: '), commitObj.shortHash],
              [chalk.green('Repository Hash: '), commitObj.repoHash],
              [chalk.red('Parity Digit'), parity],
              [chalk.cyanBright('Blockchain-Tethered Hash'), hash],
              [chalk.blue('Commit Record Location'), commitSaveDir]
            )
            log(table.toString())
            callback(null, '\n')
          })
      }).catch((err) => log(err))
  })
}

// Execution
module.exports.run = function () {
  if (f.isOn()) {
    async.waterfall([authorize, getShortHash, ideaZip, hashRepo, sendOut], function (err, result) {
      if (err) log(err)
      process.exit(0)
    })
  } else {
    log('\n\t❗ ' + chalk.bold('IdeaBlock Commit is currently set to ') + chalk.bold.rgb(242, 24, 0)('OFF') + chalk.bold('in this repository.'))
    log('\t   Please run "ideablock-commit on" in the root directory of this repository to turn on automatic commit blockchain tethering functionality.')
    process.exit(0)
  }
}
