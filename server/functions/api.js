const serverless = require('serverless-http');
const app = require('../index');

console.log('🟢 Starting serverless handler');

module.exports = serverless(app, {
  callbackWaitsForEmptyEventLoop: false,
});
