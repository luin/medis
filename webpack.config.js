'use strict';

module.exports = {
  entry: {
    main: './client/main.jsx',
    'pattern-manager': './client/pattern-manager.jsx'
  },
  node: {
    Buffer: false,
    buffer: false
  },
  output: {
    filename: '[name].js'
    // publicPath: 'http://localhost:8090/assets'
  },
  module: {
    rules: [{
      test: /\.jsx$/,
      exclude: /node_modules/,
      loader: 'jsx-loader?harmony!babel-loader?stage=0&ignore=buffer'
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader?stage=0&ignore=buffer'
    }, {
      test: /\.scss$/,
      loader: 'style-loader!css-loader!sass-loader'
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.(png|jpg)$/,
      loader: "url-loader"
    }]
  },
  externals: {
    'ioredis': 'require("ioredis")',
    'electron': 'require("electron")',
    'redis-commands': 'require("redis-commands")',
    'ssh2': 'require("ssh2")',
    'net': 'require("net")',
    'remote': 'require("remote")',
    'shell': 'require("shell")',
    'app': 'require("app")',
    'ipc': 'require("ipc")',
    'fs': 'require("fs")',
    'buffer': 'require("buffer")',
    'system': '{}',
    'file': '{}'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
