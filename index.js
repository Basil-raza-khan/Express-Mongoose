const app = require('../MongoDB/app'); // Adjust the path based on your structure
const serverless = require('serverless-http');

module.exports = serverless(app);
