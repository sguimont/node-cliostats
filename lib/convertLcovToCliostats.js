var fs = require('fs')
var lcovParse = require('lcov-parse')
var path = require('path')
var logger = require('./logger')()

var convertLcovToCoveralls = function (input, options, cb) {
  var filepath = options.filepath || ''
  logger.debug('in: ', filepath)
  filepath = path.resolve(process.cwd(), filepath)

  lcovParse(input, function (err, parsed) {
    if (err) {
      logger.error('error from lcovParse: ', err)
      logger.error('input: ', input)
      return cb(err)
    }

    var postJson = {}

    var branchHit = 0;
    var branchFound = 0;

    var lineHit = 0;
    var lineFound = 0;

    for (var i = 0; i < parsed.length; i++) {
      lineHit += parsed[ i ].lines.hit;
      lineFound += parsed[ i ].lines.found;

      branchHit += parsed[ i ].branches.hit;
      branchFound += parsed[ i ].branches.found;
    }

    postJson.coverage_line_percent = lineFound ? (lineHit / lineFound) * 100 : 0;
    postJson.coverage_branch_percent = branchFound ? (branchHit / branchFound) * 100 : 0;

    return cb(null, postJson)
  })
}

module.exports = convertLcovToCoveralls
