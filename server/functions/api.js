const serverless = require('serverless-http');
const app = require('../index');    // make sure this path is correct
const handler = serverless(app);

module.exports = handler;
exports.default = handler;
