var request = require('request')
var index = require('../index')

var sendToCoveralls = function (obj, cb) {
  var urlBase = 'https://cliostats.io'
  if (process.env.CLIOSTATS_ENDPOINT) {
    urlBase = process.env.CLIOSTATS_ENDPOINT
  }

  var str = JSON.stringify(obj)
  var url = urlBase + '/api/v1/stats'

  if (index.options.stdout) {
    process.stdout.write(str)
    cb(null, { statusCode: 200 }, '')
  } else {
    request.post({ url: url, form: { json: str } }, function (err, response, body) {
      cb(err, response, body)
    })
  }
}

module.exports = sendToCoveralls
