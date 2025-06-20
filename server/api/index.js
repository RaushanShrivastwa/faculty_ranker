// server/functions/api.js
const serverless = require('serverless-http');
const app = require('../index'); // full Express app with routes

module.exports = serverless(app, {
  callbackWaitsForEmptyEventLoop: false,
});
