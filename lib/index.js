'use strict'

var debug = require('debug-log')('echint')
var dezalgo = require('dezalgo')
var dotenv = require('dotenv')
var fs = require('fs')
var glob = require('glob')
var Lintspaces = require('lintspaces')
var path = require('path')
var pkg = require('pkg-config')('echint', { root: false })
var extend = require('xtend')

var DEFAULT_PATTERN = '**/*'
var DEFAULT_IGNORE_PATTERNS = [
  'coverage/**',
  'node_modules/**',
  'bower_components/**',
  '**[.jpg,.png,.gif,.ico]'
]

dotenv.config({ silent: true })
dotenv.config({ silent: true, path: '.env.' + process.env.NODE_ENV })

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
    config: process.env.ECHINT_CONFIG || path.join(process.cwd(), '.editorconfig'),
    ignore: process.env.ECHINT_IGNORE ? [process.env.ECHINT_IGNORE] : [],
    pattern: process.env.ECHINT_PATTERN || DEFAULT_PATTERN,
    readPackage: process.env.ECHINT_READ_PACKAGE ? (process.env.ECHINT_READ_PACKAGE === 'true') : (options ? options.readPackage : true)
  }

  debug(process.env.ECHINT_READ_PACKAGE, opts.readPackage)

  // overwrite from package.json?
  if (opts.readPackage && pkg) {
    debug('package.json config found')

    opts = extend(opts, pkg)
  }

  // overwrite from local options
  opts = extend(opts, options)

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
