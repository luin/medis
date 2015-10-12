'use strict';

module.exports = {
  entry: './index.jsx',
  output: {
    filename: 'bundle.js',
    publicPath: 'http://localhost:8090/assets'
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      loader: 'jsx-loader?harmony!babel-loader'
    }, {
      test: /\.js$/,
      loader: 'babel-loader'
    }, {
      test: /\.scss$/,
      loader: 'style!css!sass'
    }]
  },
  externals: {
    'ioredis': 'require("ioredis")'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};
