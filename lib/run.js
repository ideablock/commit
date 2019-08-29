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
const authFilePath = path.join(os.homedir(), '.ideablock', 'auth.json')
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
function authorize (callback) {
  fs.ensureDirSync(repoSaveDir, desiredMode)
  fs.pathExists(authFilePath, (err, exists) => {
    if (err) log(err)
    if (exists) {
      const authContents = fs.readFileSync(authFilePath)
      jsonAuthContents = JSON.parse(authContents)
      callback(null, jsonAuthContents.auth)
    } else {
      log(chalk.bold.rgb(255, 216, 100)('Please login with your IdeaBlock credentials.'))
      log(chalk.rgb(255, 216, 100)('(You can sign up at https://beta.ideablock.io)\n'))
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
      inquirer.prompt(loginQuestions).then(answers => {
        const tokenURL = 'https://beta.ideablock.io/cli/update-token'
        const formData = new FormData()
        formData.append('email', answers.email)
        formData.append('password', answers.password)
        const options = {
          method: 'post',
          body: formData
        }
        fetch(tokenURL, options)
          .then(res => res.json())
          .then(json => {
            jsonAuthContents = JSON.parse(json)
            fs.ensureFile(authFilePath)
              .then(() => {
                fs.writeJson(authFilePath, jsonAuthContents)
                  .then(() => {
                    callback(null, 'done')
                  })
              })
              .catch(err => {
                console.error(err)
              })
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
    .catch((err) => console.log(err))
}

// Hash Idea File
function hashRepo (zipFile, shortHash, callback) {
  var shasum = crypto.createHash('sha256')
  var s = fs.ReadStream(zipFile)
  s.on('data', function (d) { shasum.update(d) })
  s.on('end', function () {
    const repoHash = shasum.digest('hex')
    callback(null, repoHash, shortHash)
  })
}

function sendOut (repoHash, shortHash, callback) {
  const parity = getParity()
  log('\n\t\tIdeaBlock Commit Initiated\n')
  const spinner = new Ora({
    spinner: spinUp,
    indent: 5
  })
  spinner.start('  Tethering Commit to Blockchains')
  const hash = '6A616D66' + shortHash + repoHash + parity
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
        log('\t✅ Congratulations! Your commit has been successfully tethered using IdeaBlock!\n')
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
              [{ colSpan: 2, content: chalk.bold.red('Commit Information:') }],
              [chalk.yellow('Bitcoin Hash: '), commitObj.BTC],
              [chalk.gray('Litecoin Hash: '), commitObj.LTC],
              [chalk.white('Commit Short Hash: '), commitObj.shortHash],
              [chalk.green('Repository Hash: '), commitObj.repoHash],
              [chalk.red('Parity Digit'), parity],
              [chalk.cyanBright('Blockchain-Tethered Hash'), hash],
              [chalk.blue('Commit Record Location'), commitSaveDir]
            )
            console.log(table.toString())
            console.log('')
            callback(null, '\n')
          })
      }).catch((err) => log(err))
  })
}
// Execution
module.exports.run = function () {
  if (this.isOn) {
    async.waterfall([authorize, getShortHash, ideaZip, hashRepo, sendOut], function (err, result) {
      if (err) console.log(err)
      log(result)
      process.exit(0)
    })
  } else {
    console.log('IdeaBlock Commit is currently set to "off" in this repository.')
    console.log('Please run "ideablock-commit on" in the root directory of this repository to turn automatic commit blockchain tethering on.')
    process.exit(0)
  }
}
