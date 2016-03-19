var should = require('should')
var request = require('request')
var sinon = require('sinon-restore')
var index = require('../index')
logger = require('log-driver')({ level: false })

describe('sendToCliostats', function () {
  var realCliostatsHost
  beforeEach(function () {
    realCliostatsHost = process.env.CLIOSTATS_ENDPOINT
  })

  afterEach(function () {
    sinon.restoreAll()
    if (realCliostatsHost !== undefined) {
      process.env.CLIOSTATS_ENDPOINT = realCliostatsHost
    } else {
      delete process.env.CLIOSTATS_ENDPOINT
    }
  })

  it('passes on the correct params to request.post', function (done) {
    sinon.stub(request, 'post', function (obj, cb) {
      obj.url.should.equal('https://cliostats.io/api/v1/stats')
      obj.form.should.eql({ json: '{"some":"obj"}' })
      cb('err', 'response', 'body')
    })

    var obj = { 'some': 'obj' }

    index.sendToCliostats(obj, function (err, response, body) {
      err.should.equal('err')
      response.should.equal('response')
      body.should.equal('body')
      done()
    })
  })

  it('allows sending to enterprise url', function (done) {
    process.env.CLIOSTATS_ENDPOINT = 'https://cliostats-ubuntu.domain.com'
    sinon.stub(request, 'post', function (obj, cb) {
      obj.url.should.equal('https://cliostats-ubuntu.domain.com/api/v1/stats')
      obj.form.should.eql({ json: '{"some":"obj"}' })
      cb('err', 'response', 'body')
    })

    var obj = { 'some': 'obj' }
    index.sendToCliostats(obj, function (err, response, body) {
      err.should.equal('err')
      response.should.equal('response')
      body.should.equal('body')
      done()
    })
  })
  it('writes output to stdout when --stdout is passed', function (done) {
    var obj = { 'some': 'obj' }

    // set up mock process.stdout.write temporarily
    var origStdoutWrite = process.stdout.write
    process.stdout.write = function (string) {
      if (string == JSON.stringify(obj)) {
        process.stdout.write = origStdoutWrite
        return done()
      }

      origStdoutWrite.apply(this, arguments)
    }

    index.options.stdout = true

    index.sendToCliostats(obj, function (err, response, body) {
      response.statusCode.should.equal(200)
    })
  })
})
