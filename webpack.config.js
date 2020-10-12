import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CleanWebpackPlugin from "clean-webpack-plugin";
import WriteFilePlugin from "write-file-webpack-plugin";
import BundleAnalyzerPlugin from 'webpack-bundle-analyzer'
import webpack from 'webpack'
let __dirname = path.resolve(path.dirname(""));

const module = {
	mode: "production",
	entry: {
        index: ['./src/index.jsx','webpack-hot-middleware/client']
    },
	module: {
		rules: [
			{
				test: /\.js|jsx$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				options: {
					presets: ["@babel/preset-env", "@babel/preset-react"],
				}
			},
			{
				test: /\.(sa|sc|c)ss$/,
				use: [{
					loader: "style-loader"
				},
				{
					loader: "css-loader"
				},
				{
					loader: "sass-loader"
				}
				]
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin.CleanWebpackPlugin(),
		// new WriteFilePlugin(),
		new HtmlWebpackPlugin({
			hash: true,
			template: "./src/index.html",
			filename: "index.html",
			chunks: ["index"],
		}),
    new webpack.HotModuleReplacementPlugin(),
    // Use NoErrorsPlugin for webpack 1.x
    new webpack.NoEmitOnErrorsPlugin()
	],
	output: {
		filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, "dist"),
        publicPath: '/'

	},
	optimization: {
		moduleIds: 'deterministic',

		runtimeChunk: 'single',
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all',
				},
			},
		},
	}
};
export default module;