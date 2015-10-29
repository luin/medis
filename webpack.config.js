'use strict';

module.exports = {
  entry: {
    main: './client/main.jsx',
    'pattern-manager': './client/pattern-manager.jsx'
  },
  output: {
    filename: '[name].js',
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
    'ioredis': 'require("ioredis")',
    'remote': 'require("remote")',
    'shell': 'require("shell")',
    'app': 'require("app")',
    'ipc': 'require("ipc")',
    'fs': 'require("fs")'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};
