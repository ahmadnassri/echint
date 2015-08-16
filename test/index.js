/* global describe, it */

'use strict'

var echint = require('..')
var should = require('should')

describe('echint', function () {
  it('should use default values', function (done) {
    echint().should.be.true

    done()
  })

  it('should use list of files', function (done) {
    var result = echint([
      'test/fixtures/invalid',
      'test/fixtures/invalid.js',
      'test/fixtures/valid.js'
    ], {
      readPackage: false
    })

    result.should.be.false

    done()
  })

  it('should match file pattern', function (done) {
    var result = echint({
      pattern: 'test/fixtures/*',
      readPackage: false
    })

    result.should.be.false

    done()
  })

  it('should read custom config file', function (done) {
    var result = echint({
      config: 'test/fixtures/.config',
      pattern: 'test/fixtures/*',
      readPackage: false
    })

    result.should.be.false

    done()
  })

  it('should ignore files when using a pattern', function (done) {
    var result = echint({
      config: 'test/fixtures/.config',
      ignore: ['test/fixtures/invalid*'],
      pattern: 'test/fixtures/*',
      readPackage: false
    })

    result.should.be.true

    done()
  })

  it('should ignore none existant files', function (done) {
    var result = echint([
      'test/fixtures/fakefile'
    ], {
      config: 'test/fixtures/.config',
      pattern: 'test/fixtures/*',
      readPackage: false
    })

    result.should.be.true

    done()
  })

  it('should ignore files when sending a list', function (done) {
    var result = echint([
      'test/fixtures/invalid'
    ], {
      config: 'test/fixtures/.config',
      ignore: ['test/fixtures/invalid'],
      pattern: 'test/fixtures/*',
      readPackage: false
    })

    result.should.be.true

    done()
  })

  it('should ignore none files', function (done) {
    var result = echint([
      'test/fixtures'
    ], {
      config: 'test/fixtures/.config',
      pattern: 'test/fixtures/*',
      readPackage: false
    })

    result.should.be.true

    done()
  })

  it('should use callbacks', function (done) {
    echint({
      config: 'test/fixtures/.config',
      ignore: ['test/fixtures/invalid*'],
      pattern: 'test/fixtures/*',
      readPackage: false
    }, function (errors, valid) {
      should.not.exist(errors)
      valid.should.be.true

      done()
    })
  })

  it('should pass invalid files', function (done) {
    echint({
      config: 'test/fixtures/.config',
      pattern: 'test/fixtures/*',
      readPackage: false
    }, function (errors, valid) {
      valid.should.be.false
      errors.should.be.an.Object

      errors['test/fixtures/invalid'].should.be.an.Object
      errors['test/fixtures/invalid.js'].should.be.an.Object

      done()
    })
  })

  it('should read from environment variables', function (done) {
    process.env.ECHINT_CONFIG = 'test/fixtures/.config'
    process.env.ECHINT_IGNORE = 'test/fixtures/invalid*'
    process.env.ECHINT_PATTERN = 'test/fixtures/*'

    echint({
      readPackage: false
    }, function (errors, valid) {
      should.not.exist(errors)
      valid.should.be.true

      done()
    })
  })
})
