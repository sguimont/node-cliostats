const fs = require('fs')
const lcovParse = require('lcov-parse')
const path = require('path')
const logger = require('./logger')()

var detailsToCoverage = function (length, details) {
  var coverage = new Array(length)
  details.forEach(function (obj) {
    coverage[ obj.line - 1 ] = obj.hit
  })
  return coverage
}

var convertLcovFileObject = function (file, filepath) {
  var rootpath = filepath
  filepath = path.resolve(rootpath, file.file)
  var source = fs.readFileSync(filepath, 'utf8')
  var lines = source.split('\n')
  var coverage = detailsToCoverage(lines.length, file.lines.details)
  return {
    name: path.relative(rootpath, path.resolve(rootpath, file.file)).split(path.sep).join('/'),
    source: source,
    coverage: coverage
  }
}

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
    var postJson = {
      source_files: []
    }
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
    parsed.forEach(function (file) {
      postJson.source_files.push(convertLcovFileObject(file, filepath))
    })
    return cb(null, postJson)
  })
}

module.exports = convertLcovToCoveralls
