
const { testSetup } = require('./testSetup');
module.exports = async () => {
  process.env.NODE_ENV = 'test';
  await testSetup();
};
