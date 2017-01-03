#!/usr/bin/env node

import chalk from 'chalk'
import cmd from 'commander'
import echint from '..'
import pkg from '../package.json'

cmd
  .version(pkg.version)
  .usage('[options] <file ...>')
  .option('-c, --config [path]', 'specify path for config file (defaults to ./.editorconfig)')
  .option('-i, --ignore [file]', 'files to ignore', (val, memo) => { memo.push(val); return memo })
  .option('-p, --skip-package', 'whether to skip reading config info from package.json')
  .option('-q, --quiet', 'shhh')
  .option('-v, --verbose', 'detailed errors')
  .parse(process.argv)

// alias
cmd.readPackage = !cmd.skipPackage

echint(cmd.args, cmd, (errors, valid) => {
  if (valid) {
    return
  }

  const files = Object.keys(errors)

  // print errors
  if (!cmd.quiet && !valid) {
    console.error('%s %d file(s) did not pass EditorConfig validation', chalk.red('Error:'), files.length)
  }

  if (!cmd.quiet) {
    files.forEach(file => {
      Object.keys(errors[file]).forEach(number => {
        const line = errors[file][number]

        line.forEach(err => console.error('  %s:%s %s', chalk.yellow(file), chalk.red(number), chalk.dim(err.message)))
      })
    })
  }

  // send error signal
  if (!valid) {
    process.exit(1)
  }
})
