const path = require('path');
const webpack = require('webpack');
const basePath = path.join(__dirname, '../');
const htmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
	entry: {
		vendor: ['react', 'react-dom'],
		app: path.join(basePath, './src/main.js'),
	},

	output: {
		filename: '[name]/[name].min.js',
		path: path.join(basePath, 'dist'),
	},
	resolve: {
		extensions: ['.js', '.jsx', '.json'],
	},
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: ['babel-loader'],
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				loader: ['style-loader', 'css-loader', 'postcss-loader'],
			},
			{
				test: /\.(gif|png|jpg|woff|svg|eot|ttf)$/,
				loader: ['url-loader'],
			},
		],
	},
	devtool: 'cheap-module-eval-source-map',
	devServer: {
		contentBase: path.join(basePath, './dist'),
		open: true,
		index: 'index.html',
		inline: true,
		hot: true,
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new htmlWebpackPlugin({
			title: 'react - upload',
			chunks: ['vendor', 'app'],
			filename: 'index.html',
			template: path.join(basePath, './index.html'),
			inject: 'body',
			chunksSortMode: 'dependency',
		}),
	],
};
