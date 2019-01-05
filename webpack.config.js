'use strict';

const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  watch: process.env.WEBPACK_WATCH === 'true',
  entry: {
    main: './client/windows/MainWindow/entry.jsx',
    patternManager: './client/windows/PatternManagerWindow/entry.jsx'
  },
  node: {
    Buffer: false,
    buffer: false
  },
  output: {
    chunkFilename: '[name].chunk.js',
    filename: '[name].js'
  },
  plugins: [
    new BundleAnalyzerPlugin()
  ],
  module: {
    rules: [{
      test: /\.jsx$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {ignore: ['buffer']}
      }]
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {ignore: ['buffer']}
      }]
    }, {
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader'
      ]
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader'
      ]
    }, {
      test: /\.(png|jpg)$/,
      use: [{
        loader: "url-loader"
      }]
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
    extensions: ['.js', '.jsx']
  }
}
