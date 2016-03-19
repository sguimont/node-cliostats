var fs = require('fs')
var xml2js = require('xml2js')
var Promise = require('bluebird')

Promise.promisifyAll(fs)
Promise.promisifyAll(xml2js)

/**
 * @param {!Object} root The root element of a JUnit XML file
 * @return {number} The number of failed tests described by the given file (including tests that resulted in errors)
 * @throws {Error} If a {@code testsuite} element's errors or failures attributes can't be parsed into numbers
 */
function getFailureCount (root) {
  if ('testsuites' in root) {
    return getTestSuitesFailureCount(root.testsuites)
  } else {
    return getTestSuiteFailureCount(root.testsuite)
  }
}

/**
 * @param {!Object} root The root element of a JUnit XML file
 * @return {number} The number of tests described by the given file (including tests that resulted in errors)
 * @throws {Error} If a {@code testsuite} element's tests attributes can't be parsed into numbers
 */
function getTestsCount (root) {
  if ('testsuites' in root) {
    return getTestSuitesTestsCount(root.testsuites)
  } else {
    return getTestSuiteTestsCount(root.testsuite)
  }
}

/**
 * @param {!Object} root The root element of a JUnit XML file
 * @return {number} The number of skipped tests described by the given file (including tests that resulted in errors)
 * @throws {Error} If a {@code testsuite} element's skipped attributes can't be parsed into numbers
 */
function getSkippedCount (root) {
  if ('testsuites' in root) {
    if (!root.testsuites[ '$' ]) {
      return 0;
    }
    return getNumberAttribute(root.testsuites[ '$' ], 'skipped')
  } else {
    return 0;
  }
}

/**
 * @param {!Object} attributes An XML element's attributes
 * @param {string} key The key of the attribute to retrieve
 * @return {number} The specified attribute as a number
 * @throws {Error} If the specified attribute is not present or couldn't be parsed into a number
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
 * @param {!Object} testSuite A JUnit XML {@code testsuite} element
 * @see getTestsCount
 */
function getTestSuiteTestsCount (testSuite) {
  return getNumberAttribute(testSuite[ '$' ], 'tests')
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
 * @param {!Object} testSuites A JUnit XML {@code testsuites} element
 * @see getTestsCount
 */
function getTestSuitesTestsCount (testSuites) {
  return testSuites.testsuite.reduce(function (testsCount, testSuite) {
    return testsCount + getTestSuiteTestsCount(testSuite)
  }, 0)
}

/**
 * @param {string} path A path to a JUnit XML file
 * @return {!Promise} A promise that is resolved iff the specified file
 *     describes a successful test run otherwise, it is rejected with an
 *     {@code Error}
 */
function parse (path, options) {
  return fs.readFileAsync(path, { encoding: 'utf8' }).then(extractStatistics)
}

/**
 * @param {string} xml JUnit XML
 * @return {!Promise} A promise that is resolved extract the global statistics
 */
function extractStatistics (xml) {
  return xml2js.parseStringAsync(xml).then(function (root) {
    return {
      tests: getTestsCount(root),
      failure: getFailureCount(root),
      skipped: getSkippedCount(root)
    }
  })
}

module.exports = {
  parse: parse,
  extractStatistics: extractStatistics
}
