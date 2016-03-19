const fs = require('fs')
const lcovParse = require('lcov-parse')
const path = require('path')
const logger = require('./logger')()

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

    if (options.git) {
      postJson.git = options.git
    }
    if (options.run_at) {
      postJson.run_at = options.run_at
    }
    if (options.service_name) {
      postJson.service_name = options.service_name
    }
    if (options.service_job_id) {
      postJson.service_job_id = options.service_job_id
    }
    if (options.service_pull_request) {
      postJson.service_pull_request = options.service_pull_request
    }
    if (options.repo_token) {
      postJson.repo_token = options.repo_token
    }
    if (options.parallel) {
      postJson.parallel = options.parallel
    }
    if (options.service_pull_request) {
      postJson.service_pull_request = options.service_pull_request
    }

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

    console.log(postJson);

    return cb(null, postJson)
  })
}

module.exports = convertLcovToCoveralls
