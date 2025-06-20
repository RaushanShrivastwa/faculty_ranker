// server/api/index.js
const serverless = require('serverless-http');
const app        = require('../index');   // pulls in server/index.js
module.exports = serverless(app);
