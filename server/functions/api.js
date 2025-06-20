// server/functions/api.js
const serverless = require('serverless-http');
const app = require('../index');    // path to your Express app
module.exports = serverless(app);   // <— note: export directly, not `.handler`
