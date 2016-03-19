var parseTest = require('../../lib/parseJunitTest')
var path = require('path')
var should = require('should');

/**
 * @param {string} name A fixture name
 * @returns {string} The path to the specified fixture
 */
function getFixturePath (name) {
  return path.join(__dirname, '../../fixtures/junit', name + '.xml')
}

describe('parseJunitTest', function () {
  it('handles empty XML', function (done) {
    parseTest.parse(getFixturePath('empty'))
      .catch(function () { done() })
  })

  it('handles test suites containing errors', function () {
    return parseTest.parse(getFixturePath('error')).then(function (results) {
      results.tests.should.eql(2)
      results.failure.should.eql(1)
      results.skipped.should.eql(0)
    })
  })

  it('handles test suites containing failures', function () {
    return parseTest.parse(getFixturePath('failure')).then(function (results) {
      results.tests.should.eql(2)
      results.failure.should.eql(1)
      results.skipped.should.eql(0)
    })
  })

  it('handles invalid attributes', function (done) {
    parseTest.parse(getFixturePath('invalid-attribute'))
      .catch(function () { done() })
  })

  it('handles invalid XML', function (done) {
    parseTest.parse(getFixturePath('invalid'))
      .catch(function () { done() })
  })

  it('handles multiple test suites', function () {
    return parseTest.parse(getFixturePath('multiple-success')).then(function (results) {
      results.tests.should.eql(2)
      results.failure.should.eql(0)
      results.skipped.should.eql(0)
    })
  })

  it('handles skipped test suites', function () {
    return parseTest.parse(getFixturePath('skipped')).then(function (results) {
      results.tests.should.eql(69)
      results.failure.should.eql(0)
      results.skipped.should.eql(1)
    })
  })

  it('handles multiple test suites containing failures', function () {
    return parseTest.parse(getFixturePath('multiple-failure')).then(function (results) {
      results.tests.should.eql(2)
      results.failure.should.eql(1)
      results.skipped.should.eql(0)
    })
  })

  it('handles successful test suites', function () {
    return parseTest.parse(getFixturePath('success')).then(function (results) {
      results.tests.should.eql(2)
      results.failure.should.eql(0)
      results.skipped.should.eql(0)
    })
  })
})
