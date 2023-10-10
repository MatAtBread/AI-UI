const path = require('path');
module.exports = {
   entry: './src/ai-ui',
   mode: 'production',
   watch: false,
   output: {
      filename: 'ai-ui.min.js',
      path: path.resolve(__dirname, 'lib'),
      libraryTarget: 'var',
      library: 'AIUI'
   },
   resolve: {
      extensions: ['.ts'],
      alias: {
         './ai-ui.js': './ai-ui',
         './deferred.js': './deferred',
         './iterators.js': './iterators',
         './when.js': './when',
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