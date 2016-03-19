var convertLcovToCliostats = require('../index').convertLcovToCliostats
var getOptions = require('../index').getOptions
var should = require('should')
var fs = require('fs')
var path = require('path')

describe('convertLcovToCliostats', function () {

  it('should convert a simple lcov file', function (done) {
    process.env.TRAVIS_JOB_ID = -1
    var lcovpath = __dirname + '/../fixtures/lcov/onefile.lcov'
    var input = fs.readFileSync(lcovpath, 'utf8')
    var libpath = __dirname + '/../fixtures/lib'
    convertLcovToCliostats(input, { filepath: libpath }, function (err, output) {
      should.not.exist(err)
      output.coverage_line_percent.should.equal(0)
      output.coverage_branch_percent.should.equal(0)
      done()
    })
  })

  it('should convert a istanbul lcov file', function (done) {
    process.env.TRAVIS_JOB_ID = -1
    var lcovpath = __dirname + '/../fixtures/lcov/istanbul.lcov'
    var input = fs.readFileSync(lcovpath, 'utf8')
    var libpath = __dirname + '/../fixtures/lib'
    convertLcovToCliostats(input, { filepath: libpath }, function (err, output) {
      should.not.exist(err)
      output.coverage_line_percent.should.equal(89.0625)
      output.coverage_branch_percent.should.equal(67.5)
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
      var lcovpath = __dirname + '/../fixtures/lcov/onefile.lcov'
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
