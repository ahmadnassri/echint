'use strict'

var pkg = require('pkg-config')('echint', { root: false })
var debug = require('debug')('echint')
var dezalgo = require('dezalgo')
var fs = require('fs')
var glob = require('glob')
var Lintspaces = require('lintspaces')
var path = require('path')
var util = require('util')

var DEFAULT_PATTERN = '**/*'
var DEFAULT_IGNORE_PATTERNS = [
  'node_modules/**'
]

module.exports = function (files, options, cb) {
  // organize arguments
  if (typeof arguments[1] === 'function') {
    cb = arguments[1]
    options = {}
  }

  // organize arguments
  if (!Array.isArray(arguments[0]) && typeof arguments[0] === 'object') {
    options = arguments[0]
    files = undefined
  }

  // Zalgo!
  if (typeof cb === 'function') {
    cb = dezalgo(cb)
  }

  // default values
  var opts = {
    config: path.join(process.cwd(), '.editorconfig'),
    ignore: [],
    pattern: DEFAULT_PATTERN
  }

  var readPackage = options ? options.readPackage : true

  // overwrite from package.json?
  if (readPackage && pkg) {
    debug('package.json config found')

    opts = util._extend(opts, pkg)
  }

  // overwrite from local options
  opts = util._extend(opts, options)

  // extend with pkg

  debug('starting with options: config=%s ignore=%j', opts.config, opts.ignore)

  // parse ignore patterns into a file list
  if (opts.ignore.length) {

    opts.ignore.forEach(function (pattern) {
      debug('scanning for files matching ignore pattern "%s"', pattern)

      var list = glob.sync(pattern, {
        nodir: true
      })

      debug('found "%d" files to ignore', list.length)

      // update list
      opts.ignore = opts.ignore.concat(list)
    })
  }

  // setup validator
  var lintspaces = new Lintspaces({
    editorconfig: opts.config,
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

  // files to check
  if (!files || !files.length) {
    debug('no file list given, using match pattern instead: "%s"', opts.pattern)

    files = glob.sync(opts.pattern, {
      ignore: opts.ignore.concat(DEFAULT_IGNORE_PATTERNS),
      nodir: true
    })
  }

  // Run validation
  files.forEach(function (file) {
    if (~opts.ignore.indexOf(file)) {
      debug('[%s] is ignored"', file)
      return
    }

    // confirm file exists
    try {
      if (!fs.statSync(file).isFile()) throw Error('is not a file')
    } catch (e) {
      return debug('✖ [%s] is not a file ', file)
    }

    // where the magic happens
    lintspaces.validate(file)

    // debugging
    if (Object.keys(lintspaces.getInvalidLines(file)).length) {
      debug('✖ [%s] is invalid', file)
    } else {
      debug('✓ [%s] is valid', file)
    }
  })

  // get full list of errors
  var errors = lintspaces.getInvalidFiles()

  // determine if test was a success
  var valid = Object.keys(errors).length === 0

  if (typeof cb === 'function') {
    cb(valid ? null : errors, valid)
  }

  return valid
}
