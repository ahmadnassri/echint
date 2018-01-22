'use strict'

const debuglog = require('util').debuglog
const dotenv = require('dotenv')
const fs = require('fs')
const glob = require('glob')
const Lintspaces = require('lintspaces')
const minimatch = require('minimatch')
const path = require('path')
const pkg = require('pkg-config')

const debug = debuglog('echint')
const config = pkg('echint', { root: false })

const DEFAULT_PATTERN = '**/*'
const DEFAULT_IGNORE_PATTERNS = [
  'coverage/**',
  'node_modules/**',
  'bower_components/**',
  '**/*.{jpg,png,gif,ico}'
]

dotenv.config({ silent: true })
dotenv.config({ silent: true, path: '.env.' + process.env.NODE_ENV })

module.exports = function echint (files, options, cb) {
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

  // default values
  const defaults = {
    config: process.env.ECHINT_CONFIG || '.editorconfig',
    ignore: process.env.ECHINT_IGNORE ? process.env.ECHINT_IGNORE.split(",") : DEFAULT_IGNORE_PATTERNS,
    pattern: process.env.ECHINT_PATTERN || DEFAULT_PATTERN,
    readPackage: process.env.ECHINT_READ_PACKAGE ? (process.env.ECHINT_READ_PACKAGE === 'true') : (options ? options.readPackage : true)
  }

  // initialize options
  let opts = Object.assign({}, defaults)

  // overwrite from package.json?
  if (opts.readPackage && config) {
    debug('package.json config found')

    Object.assign(opts, config)
  }

  // overwrite from local options again
  Object.assign(opts, options)

  if (opts.extends) {
    debug('extends found')

    let extendsDir = path.join(process.cwd(), 'node_modules', opts.extends.replace(/^(echint-config-)?/, 'echint-config-'))

    let extendsMain = pkg('main', { cwd: extendsDir, root: false })

    opts.config = path.join(extendsDir, extendsMain || '.editorconfig')
  }

  debug('starting with options: config=%s ignore=%j', opts.config, opts.ignore)

  // setup validator
  const lintspaces = new Lintspaces({
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

    // since glob already ignored files for us, do NOT check later
    opts.ignore = []
  }

  // Run validation
  files.forEach(file => {
    if (opts.ignore.some(pattern => minimatch(file, pattern))) {
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
  const errors = lintspaces.getInvalidFiles()

  // determine if test was a success
  const valid = Object.keys(errors).length === 0

  if (typeof cb === 'function') {
    cb(valid ? null : errors, valid)
  }

  return valid
}
