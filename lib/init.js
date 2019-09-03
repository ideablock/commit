#!/usr/bin/env node
const path = require('path')
const fs = require('fs-extra')
const shell = require('shelljs')
const async = require('async')
const chalk = require('chalk')
const f = require('./helpers.js')
const os = require('os')
const figlet = require('figlet')
const FormData = require('form-data')
const fetch = require('node-fetch')
const inquirer = require('inquirer')
const repoName = path.basename(process.cwd())
const contents = '"#!/bin/bash\nideablock-commit run "'
const authFilePath = path.join(os.homedir(), '.ideablock', 'auth.json')
const repoSaveDir = path.join(os.homedir(), '.ideablock', 'commits', repoName)
const tokenURL = 'https://beta.ideablock.io/cli/update-token'
const contentsConf = 'echo ' + contents + '>> ' + path.join(process.cwd(), '.ideablock', 'post-commit')
const contentsHooks = 'echo ' + contents + '>> ' + path.join(process.cwd(), '.git', 'hooks', 'post-commit')
const log = console.log
let jsonAuthContents = {}
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

function banner () {
  log('\n')
  log(figlet.textSync('IdeaBlock', {
    font: 'slant',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  }))
  log(chalk.bold.rgb(255, 216, 100)('Please login with your IdeaBlock credentials.'))
  log(chalk.rgb(255, 216, 100)('(You can sign up at https://beta.ideablock.io)\n'))
}

function authorize () {
  fs.ensureDirSync(repoSaveDir)
  fs.pathExists(path.join(os.homedir(), '.ideablock', 'auth.json'), (err, exists) => {
    if (err) log(err)
    if (exists) {
      const authContents = fs.readFileSync(path.join(os.homedir(), '.ideablock', 'auth.json'))
      jsonAuthContents = JSON.parse(authContents)
    } else {
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
                      .then(() => fs.writeJson(authFilePath, jsonAuthContents, function () {
                        setup()
                      }))
                      .catch((err) => console.log(err))
                  })
                  .catch((err) => {
                    log(chalk.red('\nIncorrect password, please try again.'))
                    log(chalk.red('Please visit https://beta.ideablock.io to register.\n'))
                  })
              }
            })
        })
    }
  })
}

function setup () {
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

module.exports.init = function () {
  if (!f.authed()) {
    banner()
    authorize()
  } else {
    setup()
  }
}
