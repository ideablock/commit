#!/usr/bin/env node
const chalk = require('chalk')
const log = console.log

module.exports.help = function () {
  log(chalk.bold.underline.blue('Commands: \n\n'))
  log('init:\t \n\n')
  log('on: \t \n\n')
  log('off:\t \n\n')
  log('status: \n\n')
  log('remove:\t \n\n')
}
