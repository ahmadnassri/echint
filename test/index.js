import echint from '../src/index'
import { test } from 'tap'

const readPackage = false

test('should use default values', (assert) => {
  assert.plan(1)

  assert.ok(echint())
})

test('should use list of files', (assert) => {
  assert.plan(1)

  const result = echint([
    'test/fixtures/invalid',
    'test/fixtures/invalid.js',
    'test/fixtures/valid.js'
  ], { readPackage })

  assert.notOk(result)
})

test('should match file pattern', (assert) => {
  assert.plan(1)

  const result = echint({ pattern: 'test/fixtures/*', readPackage })

  assert.notOk(result)
})

test('should read custom config file', (assert) => {
  assert.plan(1)

  const result = echint({
    config: 'test/fixtures/.config',
    pattern: 'test/fixtures/*',
    readPackage
  })

  assert.notOk(result)
})

test('should ignore files when using a pattern', (assert) => {
  assert.plan(1)

  const result = echint({
    config: 'test/fixtures/.config',
    ignore: ['test/fixtures/invalid*'],
    pattern: 'test/fixtures/*',
    readPackage
  })

  assert.ok(result)
})

test('should ignore none existant files', (assert) => {
  assert.plan(1)

  const result = echint([
    'test/fixtures/fakefile'
  ], {
    config: 'test/fixtures/.config',
    pattern: 'test/fixtures/*',
    readPackage
  })

  assert.ok(result)
})

test('should ignore files when sending a list', (assert) => {
  assert.plan(1)

  const result = echint([
    'test/fixtures/invalid'
  ], {
    config: 'test/fixtures/.config',
    ignore: ['test/fixtures/invalid'],
    pattern: 'test/fixtures/*',
    readPackage
  })

  assert.ok(result)
})

test('should ignore none files', (assert) => {
  assert.plan(1)

  const result = echint([
    'test/fixtures'
  ], {
    config: 'test/fixtures/.config',
    pattern: 'test/fixtures/*',
    readPackage
  })

  assert.ok(result)
})

test('should use callbacks', (assert) => {
  assert.plan(2)

  echint({
    config: 'test/fixtures/.config',
    ignore: ['test/fixtures/invalid*'],
    pattern: 'test/fixtures/*',
    readPackage
  }, (errors, valid) => {
    assert.equal(errors, null)
    assert.ok(valid)
  })
})

test('should pass invalid files', (assert) => {
  assert.plan(4)

  echint({
    config: 'test/fixtures/.config',
    pattern: 'test/fixtures/*',
    readPackage
  }, (errors, valid) => {
    assert.notOk(valid)
    assert.type(errors, Object)

    assert.type(errors['test/fixtures/invalid'], Object)
    assert.type(errors['test/fixtures/invalid.js'], Object)
  })
})

test('should read from environment variables', (assert) => {
  assert.plan(2)

  process.env.ECHINT_CONFIG = 'test/fixtures/.config'
  process.env.ECHINT_IGNORE = 'test/fixtures/invalid*'
  process.env.ECHINT_PATTERN = 'test/fixtures/*'

  echint({ readPackage }, (errors, valid) => {
    assert.equal(errors, null)
    assert.ok(valid)
  })
})

test('should read sharable config file', (assert) => {
  assert.plan(1)

  const result = echint({
    extends: 'jquery',
    pattern: 'test/fixtures/*',
    readPackage
  })

  assert.ok(result)
})
