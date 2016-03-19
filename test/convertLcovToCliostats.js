const convertLcovToCliostats = require('../index').convertLcovToCliostats
const getOptions = require('../index').getOptions
const should = require('should')
const fs = require('fs')
const path = require('path')

describe('convertLcovToCliostats', function () {

  it('should convert a simple lcov file', function (done) {
    process.env.TRAVIS_JOB_ID = -1
    var lcovpath = __dirname + '/../fixtures/onefile.lcov'
    var input = fs.readFileSync(lcovpath, 'utf8')
    var libpath = __dirname + '/../fixtures/lib'
    convertLcovToCliostats(input, { filepath: libpath }, function (err, output) {
      should.not.exist(err)
      output.source_files[ 0 ].name.should.equal('index.js')
      output.source_files[ 0 ].source.split('\n').length.should.equal(171)
      output.source_files[ 0 ].coverage[ 54 ].should.equal(0)
      output.source_files[ 0 ].coverage[ 60 ].should.equal(0)
      done()
    })
  })

  it('should pass on all appropriate parameters from the environment', function (done) {
    process.env.TRAVIS_JOB_ID = -1
    process.env.CLIOSTATS_GIT_COMMIT = 'GIT_HASH'
    process.env.CLIOSTATS_GIT_BRANCH = 'master'
    process.env.CLIOSTATS_SERVICE_NAME = 'SERVICE_NAME'
    process.env.CLIOSTATS_SERVICE_JOB_ID = 'SERVICE_JOB_ID'
    process.env.CLIOSTATS_REPO_TOKEN = 'REPO_TOKEN'
    process.env.CI_PULL_REQUEST = 'https://github.com/fake/fake/pulls/123'
    process.env.CLIOSTATS_PARALLEL = 'true'

    getOptions(function (err, options) {
      var lcovpath = __dirname + '/../fixtures/onefile.lcov'
      var input = fs.readFileSync(lcovpath, 'utf8')

      options.filepath = 'fixtures/lib'
      convertLcovToCliostats(input, options, function (err, output) {
        should.not.exist(err)
        output.service_pull_request.should.equal('123')
        output.parallel.should.equal(true)
        //output.git.should.equal('GIT_HASH')
        done()
      })
    })
  })

  it('should work with a relative path as well', function (done) {
    process.env.TRAVIS_JOB_ID = -1
    var lcovpath = __dirname + '/../fixtures/onefile.lcov'
    var input = fs.readFileSync(lcovpath, 'utf8')
    var libpath = 'fixtures/lib'
    convertLcovToCliostats(input, { filepath: libpath }, function (err, output) {
      should.not.exist(err)
      output.source_files[ 0 ].name.should.equal('index.js')
      output.source_files[ 0 ].source.split('\n').length.should.equal(171)
      done()
    })
  })

  it('should convert absolute input paths to relative', function (done) {
    process.env.TRAVIS_JOB_ID = -1
    var lcovpath = __dirname + '/../fixtures/istanbul.lcov'
    var input = fs.readFileSync(lcovpath, 'utf8')
    var libpath = '/Users/deepsweet/Dropbox/projects/svgo/lib'
    var sourcepath = path.resolve(libpath, 'svgo/config.js')

    var originalReadFileSync = fs.readFileSync
    fs.readFileSync = function (filepath) {
      if (filepath === sourcepath) {
        return ''
      }

      return originalReadFileSync.apply(fs, arguments)
    }

    convertLcovToCliostats(input, { filepath: libpath }, function (err, output) {
      fs.readFileSync = originalReadFileSync

      should.not.exist(err)
      output.source_files[ 0 ].name.should.equal(win32ToPosix(path.join('svgo', 'config.js')))
      done()
    })
  })
})

/**
 * Transform a win32 path to a posix path.
 * We need to force posix url format when we run on Window OS
 * (cannot use the path lib without replace,emt the '\' by '/').
 *
 * @param {string} str
 * @returns {string}
 */

function win32ToPosix (str) {
  return str.replace(/\\/g, '/');
}
