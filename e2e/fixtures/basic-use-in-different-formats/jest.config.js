/**
 * @type {import("jest").Config}
 **/
const jestConf = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest/presets/js-with-ts',
  testRegex: 'src/index\\.test-.*',
};

module.exports = jestConf;
