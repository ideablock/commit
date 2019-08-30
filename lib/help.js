#!/usr/bin/env node
const chalk = require('chalk')
const log = console.log

module.exports.help = function () {
  log('\n\n')
  log(chalk.bold.rgb(147, 213, 216)('\t   o-O-o    o         o--o  o          o  o  '))
  log(chalk.bold.rgb(147, 213, 216)('\t     |      |         |   | |          | /  '))
  log(chalk.bold.rgb(147, 213, 216)('\t     |    o-O o-o  oo O--o  | o-o  o-o O   '))
  log(chalk.bold.rgb(147, 213, 216)('\t     |   |  | |-` |  ||   | | | | |    | \\  '))
  log(chalk.bold.rgb(147, 213, 216)('\t   o-O-o  o-o o-o o-o-o--o  o o-o  o-o o  o '))
  log(chalk.bold.rgb(147, 213, 216)('\t                                         '))
  log(chalk.bold.rgb(147, 213, 216)('\t                                         '))
  log(chalk.bold.rgb(254, 123, 34)('\t    o-o                     o               '))
  log(chalk.bold.rgb(254, 123, 34)('\t    /                    o  |               '))
  log(chalk.bold.rgb(254, 123, 34)('\t   O     o-o o-O-o o-O-o   -o-              '))
  log(chalk.bold.rgb(254, 123, 34)('\t    \\    | | | | | | | | |  |               '))
  log(chalk.bold.rgb(254, 123, 34)('\t     o-o o-o o o o o o o |  o               '))
  log(chalk.bold.rgb(254, 123, 34)('                                         '))
  log(chalk.bold.rgb(254, 123, 34)('                                         '))

  log(chalk.bold.underline.blue('\n\nCommands: \n'))
  log(chalk.bold.rgb(254, 123, 34)('\tinit (or "i")') + ':\t\t  Initializes automatic git commit blockchain tethering in the present repository.\n\n')
  log(chalk.bold.rgb(254, 123, 34)('\ton (or "resume")') + ':\t  Turns on (resumes) automatic commit tethering in the present repository.\n\n')
  log(chalk.bold.rgb(254, 123, 34)('\toff (or "pause")') + ':\t  Turns off (pauses) automatic commit tethering in the present repository.\n\n')
  log(chalk.bold.rgb(254, 123, 34)('\tstatus (or "ping")') + ':\t  Prints whether IdeaBlock Commit is currently initialized and on or off in the present repository\n\n')
  log(chalk.bold.rgb(254, 123, 34)('\tremove (or "uninstall")') + ':  Removes IdeaBlock Commit automatic blockchain tethering functionality from the present repository\n\n')
}
