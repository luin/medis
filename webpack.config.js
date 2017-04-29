'use strict';

const path = require('path')

module.exports = {
  entry: {
    main: './client/windows/MainWindow/entry.jsx',
    patternManager: './client/windows/PatternManagerWindow/entry.jsx'
  },
  node: {
    Buffer: false,
    buffer: false
  },
  output: {
    filename: '[name].js'
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      exclude: /node_modules/,
      loader: 'jsx-loader?harmony!babel?stage=0&ignore=buffer'
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel?stage=0&ignore=buffer'
    }, {
      test: /\.scss$/,
      loader: 'style!css!sass'
    }, {
      test: /\.css$/,
      loader: 'style!css'
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
    alias: {
      Redux: path.resolve(__dirname, 'client/redux/'),
      Utils: path.resolve(__dirname, 'client/utils/'),
    },
    extensions: ['', '.js', '.jsx']
  }
}
