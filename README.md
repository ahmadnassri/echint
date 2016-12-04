# ECHint [![version][npm-version]][npm-url] [![License][npm-license]][license-url]

> Quick validation of files with [EditorConfig](http://editorconfig.org/).

[![Build Status][travis-image]][travis-url]
[![Downloads][npm-downloads]][npm-url]
[![Code Climate][codeclimate-quality]][codeclimate-url]
[![Coverage Status][codeclimate-coverage]][codeclimate-url]
[![Dependency Status][dependencyci-image]][dependencyci-url]
[![Dependencies][david-image]][david-url]

## Install

The easiest way to use ECHint to check your code is to install it globally as a Node command line program. To do so, simply run the following command in your terminal (flag `-g` installs `echint` globally on your system, omit it if you want to install in the current working directory):

```bash
npm install --only=production --save --global echint
```

After you've done that you should be able to use the `echint` CLI. The simplest use case would be checking all files in the current working directory:

```bash
$ echint
Error: some files did not pass EditorConfig validation:
  src/index.js:97 Expected a newline at the end of the file.
  src/path/data.json:2 Unexpected tabs found.
```

You can optionally pass one or more paths using the glob pattern:

```bash
$ echint *.js docs/**/*.md
```

### How do I ignore files?

The path `node_modules/**` and hidden files/folders (beginning with `.`) are automatically excluded when looking for files to check.

Sometimes you need to ignore additional folders or specific minified files. To do that, add a `echint.ignore` property to `package.json`:

```json
"echint": {
  "ignore": [
    "**/out/**",
    "**/build/**"
  ]
}
```

### Can I use a sharable configuration?

Yes, you may prefer to check your code against a centralized `.editorconfig`. To do that, add a `echint.extends` property to `package.json`:

```json
"echint": {
  "extends": "echint-config-some-config"
}
```

echint will use the `main` property or `.editorconfig` file from that package as the configuration. The `echint-config-` prefix will be added automatically if it is not already present.

### use your ENV

echint uses [`dotenv`](https://www.npmjs.com/package/dotenv) to load the following environment config values:

| name                  | type      | description                                                         |
| --------------------- | --------- | ------------------------------------------------------------------- |
| `ECHINT_CONFIG`       | `string`  | path to `.editorconfig` file                                        |
| `ECHINT_IGNORE`       | `string`  | pattern of files to ignore                                          |
| `ECHINT_PATTERN`      | `string`  | pattern of file to process                                          |
| `ECHINT_READ_PACKAGE` | `string`  | read additional options from `package.json` *(`"true"`, `"false"`)* |

you can create a local `.env` or `.env.[NODE_ENV]` file to modify echint's default behavior *(where `NODE_ENV` is the name of your environment)*, or you can test this directly from the shell:

```bash
$ ECHINT_CONFIG=**/* echint *.js docs/**/*.md
```

### include in your tests

1. Add it to `package.json`

  ```json
  {
    "name": "my-cool-package",
    "devDependencies": {
      "echint": "^1.0.0"
    },
    "scripts": {
      "test": "echint && node my-tests.js"
    }
  }
  ```

2. Validate all files automatically when you run `npm test`

  ```bash
  $ npm test
  Error: some files did not pass EditorConfig validation:
    src/index.js:97 Expected a newline at the end of the file.
    src/path/data.json:2 Unexpected tabs found.
  ```

3. Never deal with inconsistencies in a pull request again!

## Usage

```

  Usage: echint [options] <file ...>

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -c, --config [path]  specify path for config file (defaults to ./.editorconfig)
    -i, --ignore [file]  files to ignore
    -p, --skip-package   whether to skip reading config info from package.json
    -q, --quiet          shhh
    -v, --verbose        detailed errors

```

###### Examples

```shell
# run with defaults
$ echint

# run on a subset of files
$ echint *.js *.md --verbose

# ignore some files
$ echint * --ignore *.md  --verbose

# use custom config file path
$ echint --config ~/.editorconfig  --verbose
```

## API

### `echint()`

> validate everything in current directory

### `echint(files, [, options [, callback]]])`

returns `true` | `false`

#### Parameters

| name        | type    | description                               | required | default      |
| ----------- | ------- | ----------------------------------------- | -------- | ------------ |
| `files`     | `mixed` | manually defined list of files to process | `no`     | `**/*`       |
| `options`   | `mixed` | see [`options`](#options)                 | `no`     |              |
| `callback`  | `mixed` | see [`callback`](#callback)               | `no`     | `undefined`  |

#### Options

| name          | type      | description                                 | required | default                                                                              |
| ------------- | --------- | ------------------------------------------- | -------- | ------------------------------------------------------------------------------------ |
| `config`      | `string`  | path to `.editorconfig` file                | `no`     | `**/*`                                                                               |
| `ignore`      | `array`   | array of files & patterns to ignore         | `no`     | `['coverage/**', 'node_modules/**', 'bower_components/**', '**[.jpg,.png,.gif,.ico]` |
| `pattern`     | `string`  | pattern of file to process                  | `no`     | `**/*`                                                                               |
| `readPackage` | `boolean` | read additional options from `package.json` | `no`     | `true`                                                                               |

#### Callback

pass a callback with the following signature:

```js
function (errors, result) {
  /* typeof errors === object */
  /* typeof result === boolean */

  /*
    errors = {
      'fileName': {
        lineNumber: [
          error details
        ]
      }
    }
  */
}
```

###### Examples

```js
import echint from 'echint'

const files = [
  'path/to/file.js',
  'path/to/file.css'
])

const options = {
  config: 'path/to/.editorconfig'
}

function done (errors, valid) {
  if (!valid) {
    console.log(errors)
  }
}

// with defaults
echint()

// with file list
echint(files)

// with options
echint(options)

// with callback
echint(done)

// all together!
echint(files, done)
echint(files, options)
echint(files, options, done)
echint(options, done)
```

----
> :copyright: [ahmadnassri.com](https://www.ahmadnassri.com/) &nbsp;&middot;&nbsp;
> License: [ISC][license-url] &nbsp;&middot;&nbsp;
> Github: [@ahmadnassri](https://github.com/ahmadnassri) &nbsp;&middot;&nbsp;
> Twitter: [@ahmadnassri](https://twitter.com/ahmadnassri)

[license-url]: http://choosealicense.com/licenses/isc/

[travis-url]: https://travis-ci.org/ahmadnassri/echint
[travis-image]: https://img.shields.io/travis/ahmadnassri/echint.svg?style=flat-square

[npm-url]: https://www.npmjs.com/package/echint
[npm-license]: https://img.shields.io/npm/l/echint.svg?style=flat-square
[npm-version]: https://img.shields.io/npm/v/echint.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dm/echint.svg?style=flat-square

[codeclimate-url]: https://codeclimate.com/github/ahmadnassri/echint
[codeclimate-quality]: https://img.shields.io/codeclimate/github/ahmadnassri/echint.svg?style=flat-square
[codeclimate-coverage]: https://img.shields.io/codeclimate/coverage/github/ahmadnassri/echint.svg?style=flat-square

[david-url]: https://david-dm.org/ahmadnassri/echint
[david-image]: https://img.shields.io/david/ahmadnassri/echint.svg?style=flat-square

[dependencyci-url]: https://dependencyci.com/github/ahmadnassri/echint
[dependencyci-image]: https://dependencyci.com/github/ahmadnassri/echint/badge?style=flat-square
