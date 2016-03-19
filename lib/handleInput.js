var index = require('../index')
var logger = require('./logger')()

function handleInput (input, cb, userOptions) {
  logger.debug(input)
  logger.debug('user options ' + userOptions)

  index.getOptions(function (err, options) {
    if (err) {
      logger.error('error from getOptions')
      cb(err)
      return
    }
    logger.debug(options)

    index.convertLcovToCliostats(input, options, function (err, postData) {
      if (err) {
        logger.error('error from convertLcovToCliostats')
        cb(err)
        return
      }
      logger.info('sending this to cliostats.io: ', JSON.stringify(postData))
      index.sendToCliostats(postData, function (err, response, body) {
        if (err) {
          cb(err)
          return
        }
        if (response.statusCode >= 400) {
          cb('Bad response: ' + response.statusCode + ' ' + body)
          return
        }
        logger.debug(response.statusCode)
        logger.debug(body)
        cb(null)
      })
    })
  }, userOptions)
}

module.exports = handleInput
