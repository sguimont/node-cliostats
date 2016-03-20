#!/usr/bin/env node
var fs = require('fs')
var Promise = require('bluebird')
var index = require('../index')

theLogger = index.logger();

if (!index.options.lcov && !index.options.junit) {
  throw new Error('Please provide a lcov file or a junit file or both')
}

function checkIfFileExist (path, name) {
  try {
    var stats = fs.statSync(path)
    if (stats.isDirectory()) {
      throw new Error('The "' + name + '" file "' + path + '" must be a file')
    }
  } catch (e) {
    throw new Error('The "' + name + '" file "' + path + '" does not exist')
  }
}

if (index.options.lcov) {
  checkIfFileExist(index.options.lcov, 'lcov')
}

if (index.options.junit) {
  checkIfFileExist(index.options.junit, 'junit')
}

// Ready to go
console.log(index.options)

var statsOptions = new Promise(function (resolve, reject) {
  index.getOptions(function (err, options) {
    if (err) {
      return reject(err)
    }

    return resolve(options)
  })
})

statsOptions.then(function (theOptions) {
  console.log(theOptions)

  var unitTest = Promise.resolve(null)
  if (index.options.junit) {
    unitTest = index.parseJunitTest(index.options.junit, theOptions)
  }

  var lcov = Promise.resolve(null)
  if (index.options.lcov) {
    lcov = new Promise(function (resolve, reject) {
      index.convertLcovToCliostats(index.options.lcov, theOptions, function (err, results) {
        if (err) {
          return reject(err)
        }
        return resolve(results)
      })
    })
  }

  Promise.all([ unitTest, lcov ]).spread(function (junit, lcov) {

    var postJson = {}

    if (theOptions.git) {
      postJson.git = theOptions.git
    }
    if (theOptions.run_at) {
      postJson.run_at = theOptions.run_at
    }
    if (theOptions.service_name) {
      postJson.service_name = theOptions.service_name
    }
    if (theOptions.service_job_id) {
      postJson.service_job_id = theOptions.service_job_id
    }
    if (theOptions.service_pull_request) {
      postJson.service_pull_request = theOptions.service_pull_request
    }
    if (theOptions.repo_token) {
      postJson.repo_token = theOptions.repo_token
    }
    if (theOptions.parallel) {
      postJson.parallel = theOptions.parallel
    }
    if (theOptions.service_pull_request) {
      postJson.service_pull_request = theOptions.service_pull_request
    }

    if (junit) {
      postJson.junit = junit
    }
    if (lcov) {
      postJson.lcov = lcov
    }

    return new Promise(function (resolve, reject) {
      theLogger.info('sending this to cliostats.io: ', JSON.stringify(postJson))

      index.sendToCliostats(postJson, function (err, response, body) {
        if (err) {
          return reject(err)
        }

        if (response.statusCode >= 400) {
          return reject('Bad response: ' + response.statusCode + ' ' + body)
        }

        theLogger.debug(response.statusCode)
        theLogger.debug(body)

        return resolve(body)
      })
    })
  }).then(function () {
    console.log('DONE')
  })
}).catch(function (err) {
  console.error(err)
})
