// functions/api.js

// Wrap the existing Express app with serverless-http for Netlify Functions
const serverless = require('serverless-http');

// Adjust the path to your index.js if functions folder is nested differently
// Here, we assume functions/ is inside your server/ folder alongside index.js
const app = require('../index');

// Export the handler that Netlify will invoke
module.exports.handler = serverless(app);
