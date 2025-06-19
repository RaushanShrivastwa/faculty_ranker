// functions/api.js

// This file acts as the entry point for your Express application
// when deployed as a serverless function on Netlify.

// We import your main Express application from the 'server' directory.
// The path '../server/index' means:
// - Go up one directory (from 'functions' to 'your-repo-root')
// - Then go into the 'server' directory
// - Then require the 'index.js' file within the 'server' directory.
// This is adjusted because api.js is now directly inside the 'functions' folder at the repo root.
const expressApp = require('./server/index'); // <<<--- THIS LINE HAS BEEN MODIFIED AGAIN

// 'serverless-http' is a crucial library that wraps your Express application
// to make it compatible with the AWS Lambda (which Netlify Functions use)
// event and context objects.
const serverless = require('serverless-http');

// The 'handler' function is the standard entry point for Netlify Functions.
// It takes the event and context from the serverless environment and
// passes them to your Express app via 'serverless-http'.
module.exports.handler = serverless(expressApp);

