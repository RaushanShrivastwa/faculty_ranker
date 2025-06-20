// server/functions/api.js
const serverless = require('serverless-http');
exports.handler = serverless(
  (req, res) => res.send('pong'),
  { callbackWaitsForEmptyEventLoop: false }
);
