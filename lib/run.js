#!/usr/bin/env node

const path = require('path')
const crypto = require('crypto')
const shell = require('shelljs')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const async = require('async')
const FormData = require('form-data')
const fetch = require('node-fetch')
const os = require('os')
const Table = require('cli-table2')
const chalk = require('chalk')
const Ora = require('ora')
const f = require('./helpers.js')
const authFilePath = path.join(os.homedir(), '.ideablock', 'auth.json')
const tokenURL = 'https://beta.ideablock.io/cli/update-token'
const ideaBlockURL = 'https://beta.ideablock.io/cli/create-idea-silent'
const log = console.log
const repoName = path.basename(process.cwd())
const repoSaveDir = path.join(os.homedir(), '.ideablock', 'commits', repoName)
const tempDir = path.join(os.homedir(), '.ideablock', 'tmp')
const desiredMode = 0o2775
let jsonAuthContents = {}
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

// Authorize
const authorize = function (callback) {
  fs.ensureDirSync(repoSaveDir, desiredMode)
  fs.pathExists(path.join(os.homedir(), '.ideablock', 'auth.json'), (err, exists) => {
    if (err) log(err)
    if (exists) {
      const authContents = fs.readFileSync(path.join(os.homedir(), '.ideablock', 'auth.json'))
      jsonAuthContents = JSON.parse(authContents)
      callback(null, jsonAuthContents.auth)
    } else {
      const loginQuestions = [
        {
          type: 'input',
          name: 'email',
          message: 'Email: '
        },
        {
          type: 'password',
          name: 'password',
          mask: '*',
          message: 'Password: '
        }
      ]
      inquirer.prompt(loginQuestions)
        .then(answers => {
          const formData = new FormData()
          formData.append('email', answers.email)
          formData.append('password', answers.password)
          const options = {
            method: 'post',
            body: formData
          }
          fetch(tokenURL, options)
            .then(res => {
              if (res.status === 500) {
                res.json()
                  .then((obj) => {
                    log(chalk.red('\nWe cannot seem to find an IdeaBlock account with those credentials.'))
                    log(chalk.red('Please visit https://beta.ideablock.io to register.\n'))
                    process.exit(0)
                  })
                  .catch((err) => {
                    console.log(chalk.red('\nWe cannot find an IdeaBlock account with those credentials.\nPlease visit https://beta.ideablock.io to register.\n'))
                    process.exit(0)
                  })
              } else if (res.status === 200) {
                res.json()
                  .then(obj => {
                    jsonAuthContents = JSON.parse(obj)
                    fs.ensureFile(authFilePath)
                      .then(() => fs.writeJson(authFilePath, jsonAuthContents, () => callback(null, answers)))
                      .catch((err) => console.log(err))
                  })
                  .catch((err) => {
                    log(chalk.red('\nIncorrect password, please try again.'))
                    log(chalk.red('Please visit https://beta.ideablock.io to register.\n'))
                    authorize()
                  })
              }
            })
        })
    }
  })
}

// Get short hash
function getShortHash (output, callback) {
  shell.exec('git log -1 --pretty=format:%h', { silent: true }, function (code, stdout, stderr) {
    const shortHash = stdout
    callback(null, shortHash)
  })
}

// Zip array of files
function ideaZip (shortHash, callback) {
  fs.ensureDir(tempDir, desiredMode)
    .then(() => {
      const commitSaveDir = path.join(repoSaveDir, shortHash)
      const zipFile = path.join(commitSaveDir, 'Commit-' + shortHash + '.zip')
      fs.ensureDir(commitSaveDir, desiredMode)
        .then(() => {
          shell.exec('git archive -o ' + zipFile + ' HEAD', function (code, stdout, stderr) {
            callback(null, zipFile, shortHash)
          })
        })
    })
    .catch((err) => log(err))
}

// Hash Idea File
function hashRepo (zipFile, shortHash, callback) {
  const shasum = crypto.createHash('sha256')
  const s = fs.ReadStream(zipFile)
  s.on('data', function (d) { shasum.update(d) })
  s.on('end', function () {
    const repoHash = shasum.digest('hex')
    callback(null, repoHash, shortHash)
  })
}

function sendOut (repoHash, shortHash, callback) {
  const parity = getParity()
  const spinner = new Ora({
    spinner: spinUp,
    indent: 5
  })
  spinner.start('  Tethering Commit to Blockchains')
  const hash = '49444541' + shortHash + repoHash + parity
  const apiToken = jsonAuthContents.auth
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
          BTC: output.BTC,
          LTC: output.LTC,
          authToken: jsonAuthContents.auth
        }
        fs.writeJSON(path.join(repoSaveDir, shortHash, 'commitData.json'), commitObj)
          .then(() => {
            fs.removeSync(tempDir)
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
            log('')
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
      log(result)
      process.exit(0)
    })
  } else {
    log('\n\t❗ ' + chalk.bold('IdeaBlock Commit is currently set to ') + chalk.bold.rgb(242, 24, 0)('OFF') + chalk.bold('in this repository.'))
    log('\tPlease run "ideablock-commit on" in the root directory of this repository to turn automatic commit blockchain tethering on.')
    process.exit(0)
  }
}
