'use strict';

const {resolve} = require('path')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const watch = process.env.WEBPACK_WATCH === 'true'

const distPath = resolve(__dirname, 'dist')
const base = {
  mode, watch,
  output: {
    path: distPath,
    chunkFilename: '[name].chunk.js',
    filename: '[name].js'
  },
  node: {
    Buffer: false,
    buffer: false,
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          ignore: ['buffer'],
          plugins: [
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-syntax-dynamic-import',
            '@babel/plugin-proposal-class-properties'
          ],
          presets: [
            ['@babel/preset-env', {targets: {chrome: '69'}}],
            '@babel/preset-react'
          ]
        }
      }]
    }, {
        test: /\.(ts|tsx)?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }, {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }, {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }, {
        test: /\.(png|jpg)$/,
        use: [{
          loader: "file-loader"
        }]
      }, {
        test: /\.(eot|woff|ttf)$/,
        use: [{
          loader: "file-loader"
        }]
      }]
  },
  externals: {
    'system': '{}', // jsonlint
    'file': '{}' // jsonlint
  },
}

const renderPlugins = [
  new HtmlWebpackPlugin({title: 'Medis', chunks: ['main'], filename: 'main.html'}),
  new HtmlWebpackPlugin({title: 'Manage Patterns', chunks: ['patternManager'], filename: 'patternManager.html'}),
  new MiniCssExtractPlugin({filename: '[name].css'})
]
if (mode === 'production') {
  renderPlugins.push(new BundleAnalyzerPlugin())
}
const renderer = Object.assign({}, base, {
  target: 'electron-renderer',
  output: Object.assign({}, base.output, {
    path: resolve(base.output.path, 'renderer')
  }),
  entry: {
    main: resolve(__dirname, 'src/renderer/windows/MainWindow/entry.jsx'),
    patternManager: resolve(__dirname, 'src/renderer/windows/PatternManagerWindow/entry.jsx')
  },
  plugins: renderPlugins,
  resolve: {
    alias: {
      Redux: resolve(__dirname, 'src/renderer/redux/'),
      Utils: resolve(__dirname, 'src/renderer/utils/'),
    },
    extensions: ['.js', '.jsx']
  }
})

const main = Object.assign({}, base, {
  target: 'electron-main',
  output: Object.assign({}, base.output, {
    path: resolve(base.output.path, 'main')
  }),
  entry: {
    index: resolve(__dirname, 'src/main/index.js')
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
})

module.exports = [main, renderer]
