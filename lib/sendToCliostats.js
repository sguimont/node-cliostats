var request = require('request')
var index = require('../index')

var sendToCliostats = function (obj, cb) {
  var urlBase = 'http://localhost:9000'; //'https://cliostats.io'
  if (process.env.CLIOSTATS_ENDPOINT) {
    urlBase = process.env.CLIOSTATS_ENDPOINT
  }

  var str = JSON.stringify(obj)
  var url = urlBase + '/api/stats'

  if (index.options.stdout) {
    process.stdout.write(str)
    cb(null, { statusCode: 200 }, str)
  } else {
    request.post({ url: url, json: obj}, function (err, response, body) {
      cb(err, response, body)
    })
  }
}

module.exports = sendToCliostats
