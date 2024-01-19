const path = require('path');
module.exports = {
   entry: './src/ai-ui',
   mode: 'production',
   watch: false,
   output: {
      filename: 'ai-ui.min.js',
      path: path.resolve(__dirname, 'dist'),
      library:{
         type: 'var',
         name: 'AIUI'
      }
   },
   resolve: {
      extensions: ['.ts'],
      alias: {
         './ai-ui.js': './ai-ui',
         './deferred.js': './deferred',
         './iterators.js': './iterators',
         './when.js': './when',
         './debug.js': './debug',
         './jsx-runtime.js': './jsx-runtime'
      }
   },
   module: {
      rules: [
         {
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
         },
      ],
   },
};