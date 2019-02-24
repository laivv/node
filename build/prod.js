const path = require('path');
const webpack = require('webpack');
const basePath = path.join(__dirname, '../');
const htmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
module.exports = {
  entry: {
    vendor: ['react', 'react-dom'],
    'Upload': path.join(basePath, './src/upload/Upload.tsx'),
  },

  output: {
    filename: '[name]/[name].min.js',
    path: path.join(basePath, 'dist'),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  mode: 'production',
  module: {
    rules: [
      {
        test:/\.tsx?$/,
        loader:['ts-loader','eslint-loader'],
      },
      {
        test: /\.js$/,
        enforce: "pre",
        loader: ['babel-loader','source-map-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{ loader: 'css-loader' }, { loader: 'postcss-loader' }],
        }),
      },
      {
        test: /\.(gif|png|jpg|woff|svg|eot|ttf)$/,
        loader: ['url-loader'],
      },
    ],
  },
  devtool: 'cheap-module-eval-source-map',

  plugins: [
    new htmlWebpackPlugin({
      title: 'react - upload',
      chunks: ['vendor', 'uk-upload'],
      filename: 'index.html',
      template: path.join(basePath, './index.html'),
      inject: 'body',
      chunksSortMode: 'dependency',
    }),
    new ExtractTextPlugin('[name]/[name].min.css'),
    new OptimizeCssAssetsPlugin(),
  ],
};
