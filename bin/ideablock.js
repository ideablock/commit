#!/usr/bin/env node

const program = require('commander')
const init = require('../lib/init')
const on = require('../lib/on')
const off = require('../lib/off')
const remove = require('../lib/remove')
const help = require('../lib/help')
const status = require('../lib/status')
const log = console.log

program
  .command('init')
  .alias('i')
  .description('Initiate automatic commit tethering to Bitcoin and Litecoin blockchains in the directory from which the command is called')
  .action(function () {
    init()
  })

program
  .command('on')
  .description('Turn on automatic tethering of git commits to Bitcoin and Litecoin blockchains in directory from which the command is called.')
  .action(function () {
    on()
  })

program
  .command('off')
  .description('Turn off automatic tethering of git commits to Bitcoin and Litecoin blockchains in the directory from which the command is called')
  .action(function () {
    off()
  })

  program
  .command('status')
  .alias('r')
  .description('Completely removes Ideablock Commit functionality in the directory from which the command is called, removes post-commit git hook, removes .ideablock directory from the repository')
  .action(function () {
    status()
  })


program
  .command('remove')
  .alias('r')
  .description('Completely removes Ideablock Commit functionality in the directory from which the command is called, removes post-commit git hook, removes .ideablock directory from the repository')
  .action(function () {
    remove()
  })

program
  .command('help')
  .action(function () {
    help()
  })

program.parse(process.argv)
