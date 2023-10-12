const path = require('path');
const cjs = require('./webpack.config');
cjs.output = {
    filename: 'ai-ui.cjs.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
        type: 'commonjs-static'
    }
}

cjs.mode = 'development';
cjs.devtool = 'inline-source-map';
module.exports = cjs;