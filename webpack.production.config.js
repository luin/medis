'use strict';

const webpack = require('webpack');

const config = require('./webpack.config');

const plugins = [];

plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false
    }
  }),
  new webpack.optimize.DedupePlugin(),
  new webpack.DefinePlugin({
    'process.env': { NODE_ENV: '"production"' }
  }),
  new webpack.NoErrorsPlugin()
);

config.plugins = plugins;

module.exports = config;
