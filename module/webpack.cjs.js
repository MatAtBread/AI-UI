const path = require('path');
const cjs = require('./webpack.config');
cjs.output = {
    filename: 'ai-ui.cjs.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
        type: 'commonjs-static'
    }
}

cjs.mode = 'production';
module.exports = cjs;