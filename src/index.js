import dezalgo from 'dezalgo'
import dotenv from 'dotenv'
import fs from 'fs'
import glob from 'glob'
import Lintspaces from 'lintspaces'
import path from 'path'
import pkg from 'pkg-config'
import { debuglog } from 'util'

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

export default function (files, options, cb) {
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
  const defaults = {
    config: process.env.ECHINT_CONFIG || path.join(process.cwd(), '.editorconfig'),
    ignore: process.env.ECHINT_IGNORE ? [process.env.ECHINT_IGNORE] : [],
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

  // parse ignore patterns into a file list
  if (opts.ignore.length) {
    opts.ignore.forEach(pattern => {
      debug('scanning for files matching ignore pattern "%s"', pattern)

      const list = glob.sync(pattern, { nodir: true })

      debug('found "%d" files to ignore', list.length)

      // update list
      opts.ignore = opts.ignore.concat(list)
    })
  }

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
  }

  // Run validation
  files.forEach(file => {
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
  const errors = lintspaces.getInvalidFiles()

  // determine if test was a success
  const valid = Object.keys(errors).length === 0

  if (typeof cb === 'function') {
    cb(valid ? null : errors, valid)
  }

  return valid
}
