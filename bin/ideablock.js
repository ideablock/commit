#!/usr/bin/env node

const program = require('commander')
const init = require('../lib/init')
const on = require('../lib/on')
const off = require('../lib/off')
const remove = require('../lib/remove')
const help = require('../lib/help')
const status = require('../lib/status')
const run = require('../lib/run')

program
  .command('init')
  .alias('i')
  .description('initialize automatic commit tethering to Bitcoin and Litecoin blockchains in the directory from which the command is called')
  .action(function () {
    init.init()
  })

program
  .command('on')
  .alias('resume')
  .description('Turn on automatic tethering of git commits to Bitcoin and Litecoin blockchains in directory from which the command is called.')
  .action(function () {
    on.on()
  })

program
  .command('off')
  .alias('pause')
  .description('Turn off automatic tethering of git commits to Bitcoin and Litecoin blockchains in the directory from which the command is called')
  .action(function () {
    off.off()
  })

program
  .command('status')
  .alias('ping')
  .description('Completely removes Ideablock Commit functionality in the directory from which the command is called, removes post-commit git hook, removes .ideablock directory from the repository')
  .action(function () {
    status.status()
  })

program
  .command('remove')
  .alias('uninstall')
  .description('Completely removes Ideablock Commit functionality in the directory from which the command is called, removes post-commit git hook, removes .ideablock directory from the repository')
  .action(function () {
    remove.remove()
  })

program
  .command('help')
  .action(function () {
    help.help()
  })

program
  .command('run')
  .action(function () {
    run.run()
  })

program.parse(process.argv)
