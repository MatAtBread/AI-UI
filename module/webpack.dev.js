const prod = require('./webpack.config');
prod.mode = 'development';
prod.devtool = 'inline-source-map';
prod.output.filename = 'ai-ui.js';
module.exports = prod;