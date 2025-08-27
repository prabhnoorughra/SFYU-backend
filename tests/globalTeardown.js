
const { testTeardown } = require('./testSetup');
module.exports = async () => {
  await testTeardown();
};
