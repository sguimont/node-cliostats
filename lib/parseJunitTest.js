var fs = require('fs')
var xml2js = require('xml2js')
var Promise = require('bluebird')

Promise.promisifyAll(fs)
Promise.promisifyAll(xml2js)

/**
 * @param {!Object} root The root element of a JUnit XML file
 * @return {number} The number of failed tests described by the given file
 *     (including tests that resulted in errors)
 * @throws {Error} If a {@code testsuite} element's errors or failures
 *     attributes can't be parsed into numbers
 */
function getFailureCount (root) {
  if ('testsuites' in root) {
    return getTestSuitesFailureCount(root.testsuites)
  } else {
    return getTestSuiteFailureCount(root.testsuite)
  }
}

/**
 * @param {!Object} attributes An XML element's attributes
 * @param {string} key The key of the attribute to retrieve
 * @return {number} The specified attribute as a number
 * @throws {Error} If the specified attribute is not present or couldn't be
 *     parsed into a number
 */
function getNumberAttribute (attributes, key) {
  if (typeof attributes[ key ] === 'undefined') {
    return 0;
  }

  var isEmpty = attributes[ key ] === ''
  var value = Number(attributes[ key ])

  if (isEmpty || isNaN(value)) {
    throw new Error('The attribute ' + key + ' couldn\'t be parsed into a number')
  }

  return value
}

/**
 * @param {!Object} testSuite A JUnit XML {@code testsuite} element
 * @see getFailureCount
 */
function getTestSuiteFailureCount (testSuite) {
  var errors = getNumberAttribute(testSuite[ '$' ], 'errors')
  var failures = getNumberAttribute(testSuite[ '$' ], 'failures')

  return errors + failures
}

/**
 * @param {!Object} testSuites A JUnit XML {@code testsuites} element
 * @see getFailureCount
 */
function getTestSuitesFailureCount (testSuites) {
  return testSuites.testsuite.reduce(function (failureCount, testSuite) {
    return failureCount + getTestSuiteFailureCount(testSuite)
  }, 0)
}

/**
 * @param {string} path A path to a JUnit XML file
 * @return {!Promise} A promise that is resolved iff the specified file
 *     describes a successful test run otherwise, it is rejected with an
 *     {@code UnsuccessfulError}
 */
function verifyFile (path) {
  return fs.readFileAsync(path, { encoding: 'utf8' }).then(verifyXml)
}

/**
 * @param {string} xml JUnit XML
 * @return {!Promise} A promise that is resolved iff the given JUnit XML
 *     describes a successful test run otherwise, it is rejected with an
 *     {@code Error}
 */
function verifyXml (xml) {
  return xml2js.parseStringAsync(xml).then(function (root) {
    if (getFailureCount(root) > 0) {
      throw new Error('UnsuccessfulError')
    }
  })
}

module.exports = {
  verifyFile: verifyFile,
  verifyXml: verifyXml
}
