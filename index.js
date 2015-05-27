#!/usr/bin/env node

'use strict'

var chalk = require('chalk')
var cmd = require('commander')
var debug = require('debug')('echint')
var path = require('path')
var findRoot = require('find-root')
var fs = require('fs')
var glob = require('glob')
var pkg = require('./package.json')
var Validator = require('lintspaces')

var DEFAULT_PATTERN = '**/*'
var DEFAULT_IGNORE_PATTERNS = [
  'node_modules/**'
]

cmd
  .version(pkg.version)
  .usage('[options] <file ...>')
  .option('-c, --config [path]', 'specify path for config file (defaults to ./.editorconfig)', '.editorconfig')
  .option('-i, --ignore [file]', 'files to ignore', function collect (val, memo) {
    memo.push(val)
    return memo
  }, [])
  .parse(process.argv)

// setup validator
var validator = new Validator({
  editorconfig: cmd.config,
  ignores: [
    'js-comments',
    'c-comments',
    'java-comments',
    'as-comments',
    'xml-comments',
    'html-comments',
    'python-comments',
    'ruby-comments',
    'applescript-comments'
  ]
})

var root

try {
  root = findRoot(process.cwd())
} catch (e) {
  debug(e)
}

if (root) {
  // Add ignore patterns from the closest `package.json`
  try {
    var pkg = require(path.join(root, 'package.json')).echint

    // parse ignore patterns into a file list
    if (pkg && pkg.ignore) {
      pkg.ignore.forEach(function (pattern) {
        var list = glob.sync(pattern, {
          nodir: true
        })

        // update list
        cmd.ignore = cmd.ignore.concat(list)
      })
    }
  } catch (e) {
    debug(e)
  }
}

// files to check
if (!cmd.args.length) {
  cmd.args = glob.sync(DEFAULT_PATTERN, {
    nodir: true,
    ignore: cmd.ignore.concat(DEFAULT_IGNORE_PATTERNS)
  })
}

// Run validation
cmd.args.forEach(function (file) {
  if (~cmd.ignore.indexOf(file)) {
    return
  }

  // confirm file exists
  if (fs.statSync(file).isFile()) {
    validator.validate(file)
  }
})

var errors = validator.getInvalidFiles()
var files = Object.keys(errors)

// print errors
if (files.length) {
  console.error(chalk.red('Error:') + ' some files did not pass EditorConfig validation:')
}

files.forEach(function (file) {
  Object.keys(errors[file]).forEach(function (number) {
    var line = errors[file][number]

    line.forEach(function (err) {
      console.error('  ' + chalk.yellow(file) + ':' + chalk.red(number) + ' ' + chalk.dim(err.message))
    })
  })
})

// send error signal
if (files.length) {
  process.exit(1)
}
