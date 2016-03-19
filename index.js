var minimist = require('minimist')

// this needs to go before the other require()s so that the other files can already use index.options
exports.options = minimist(process.argv.slice(2), {
  boolean: [ 'verbose', 'stdout' ],
  string: [ 'lcov', 'junit' ],
  alias: { 'v': 'verbose', 's': 'stdout' }
})

exports.convertLcovToCliostats = require('./lib/convertLcovToCliostats')
exports.sendToCliostats = require('./lib/sendToCliostats')
exports.getBaseOptions = require('./lib/getOptions').getBaseOptions
exports.getOptions = require('./lib/getOptions').getOptions
exports.handleInput = require('./lib/handleInput')
exports.parseJunitTest = require('./lib/parseJunitTest').parse
exports.logger = require('./lib/logger')
