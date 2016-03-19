var junitXml = require('../../lib/parseJunitTest')
var path = require('path')

/**
 * @param {string} name A fixture name
 * @returns {string} The path to the specified fixture
 */
function getFixturePath (name) {
  return path.join(__dirname, '../../fixtures/junit', name + '.xml')
}

describe('parseJunitTest', function () {
  it('handles empty XML', function (done) {
    junitXml.verifyFile(getFixturePath('empty'))
      .catch(function () { done() })
  })

  it('handles test suites containing errors', function (done) {
    junitXml.verifyFile(getFixturePath('error'))
      .catch(Error, function () { done() })
  })

  it('handles test suites containing failures', function (done) {
    junitXml.verifyFile(getFixturePath('failure'))
      .catch(Error, function () { done() })
  })

  it('handles invalid attributes', function (done) {
    junitXml.verifyFile(getFixturePath('invalid-attribute'))
      .catch(function () { done() })
  })

  it('handles invalid XML', function (done) {
    junitXml.verifyFile(getFixturePath('invalid'))
      .catch(function () { done() })
  })

  it('handles multiple test suites', function (done) {
    junitXml.verifyFile(getFixturePath('multiple-success')).then(done)
  })

  it('handles skipped test suites', function (done) {
    junitXml.verifyFile(getFixturePath('skipped')).then(done)
  })

  it('handles multiple test suites containing failures', function (done) {
    junitXml.verifyFile(getFixturePath('multiple-failure'))
      .catch(Error, function () { done() })
  })

  it('handles successful test suites', function (done) {
    junitXml.verifyFile(getFixturePath('success')).then(done)
  })
})
