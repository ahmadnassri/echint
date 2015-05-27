# ECHint [![version][npm-version]][npm-url] [![License][npm-license]][license-url]

Quick validation of files with [EditorConfig](http://editorconfig.org/).

[![Downloads][npm-downloads]][npm-url]
[![Code Climate][codeclimate-quality]][codeclimate-url]
[![Dependencies][david-image]][david-url]

## Install

The easiest way to use ECHint to check your code is to install it globally as a Node command line program. To do so, simply run the following command in your terminal (flag `-g` installs `echint` globally on your system, omit it if you want to install in the current working directory):

```sh
npm install echint -g
```

After you've done that you should be able to use the `echint` CLI. The simplest use case would be checking all files in the current working directory:

```shell
$ echint
Error: some files did not pass EditorConfig validation:
  src/index.js:97 Expected a newline at the end of the file.
  src/path/data.json:2 Unexpected tabs found.
```

You can optionally pass one or more paths using the glob pattern:

```shell
$ echint *.js docs/**/*.md
```

### How do I ignore files?

The path `node_modules/**` and hidden files/folders (beginning with `.`) are automatically excluded when looking for files to check.

Sometimes you need to ignore additional folders or specific minfied files. To do that, add a `echint.ignore` property to `package.json`:

```json
"echint": {
  "ignore": [
    "**/out/**",
    "**/coverage/**"
  ]
}
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

  ```shell
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

```

###### Example


```shell
# run with defaults
$ echint

# run on a subset of files
$ echint *.js *.md

# ignore some files
$ echint * --ignore *.md

# use custom config file path
$ echint --config ~/.editorconfig
```

## Support

Donations are welcome to help support the continuous development of this project.

[![Gratipay][gratipay-image]][gratipay-url]
[![PayPal][paypal-image]][paypal-url]
[![Flattr][flattr-image]][flattr-url]
[![Bitcoin][bitcoin-image]][bitcoin-url]

## License

[MIT](LICENSE) &copy; [Ahmad Nassri](https://www.ahmadnassri.com)

[license-url]: https://github.com/ahmadnassri/echint/blob/master/LICENSE

[npm-url]: https://www.npmjs.com/package/echint
[npm-license]: https://img.shields.io/npm/l/echint.svg?style=flat-square
[npm-version]: https://img.shields.io/npm/v/echint.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dm/echint.svg?style=flat-square

[codeclimate-url]: https://codeclimate.com/github/ahmadnassri/echint
[codeclimate-quality]: https://img.shields.io/codeclimate/github/ahmadnassri/echint.svg?style=flat-square

[david-url]: https://david-dm.org/ahmadnassri/echint
[david-image]: https://img.shields.io/david/ahmadnassri/echint.svg?style=flat-square

[gratipay-url]: https://www.gratipay.com/ahmadnassri/
[gratipay-image]: https://img.shields.io/gratipay/ahmadnassri.svg?style=flat-square

[paypal-url]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=UJ2B2BTK9VLRS&on0=project&os0=echint
[paypal-image]: http://img.shields.io/badge/paypal-donate-green.svg?style=flat-square

[flattr-url]: https://flattr.com/submit/auto?user_id=ahmadnassri&url=https://github.com/ahmadnassri/echint&title=echint&language=&tags=github&category=software
[flattr-image]: http://img.shields.io/badge/flattr-donate-green.svg?style=flat-square

[bitcoin-image]: http://img.shields.io/badge/bitcoin-1Nb46sZRVG3or7pNaDjthcGJpWhvoPpCxy-green.svg?style=flat-square
[bitcoin-url]: https://www.coinbase.com/checkouts/ae383ae6bb931a2fa5ad11cec115191e?name=echint
