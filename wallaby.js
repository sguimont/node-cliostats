'use strict';

module.exports = function (wallaby) {
  return {
    files: [
      'package.json',
      'index.js',
      'lib/**/*.js'
    ],
    tests: [
      'fixtures/**/*.*',
      'test/**/*.js'
    ],
    env: {
      type: 'node',
      params: {
        env: 'NODE_ENV=test'
      }
    }
  };
};
