const path = require('path')

/* eslint-disable*/
const fg = require('fast-glob')
const webpack = require('webpack')
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { dependencies, devDependencies, build } = require('../package.json')
/* eslint-enable */

const externals = Object.keys(dependencies).concat(Object.keys(devDependencies))
const isDevMode = process.env.NODE_ENV === 'development'
const whiteListedModules = ['vue']

const config = {
  mode: process.env.NODE_ENV,
  devtool: isDevMode ? 'cheap-module-eval-source-map' : false,
  entry: {
    renderer: path.join(__dirname, '../src/renderer/main.js'),
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist'),
    pathinfo: false,
    filename: '[name].js',
  },
  externals: externals.filter(d => !whiteListedModules.includes(d)),
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          isDevMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.sass$/,
        use: [
          isDevMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader?indentedSyntax',
        ],
      },
      {
        test: /\.less$/,
        use: [
          isDevMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          isDevMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.html$/,
        use: 'vue-html-loader',
      },
      {
        enforce: 'pre',
        test: /\.(js|vue)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            extractCSS: !isDevMode,
            loaders: {
              sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
              scss: 'vue-style-loader!css-loader!sass-loader',
              less: 'vue-style-loader!css-loader!less-loader',
            },
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|tiff|bmp|webp|svg)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'imgs/[name]--[folder].[ext]',
          },
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name]--[folder].[ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'fonts/[name]--[folder].[ext]',
          },
        },
      },
    ],
  },
  node: {
    __dirname: isDevMode,
    __filename: isDevMode,
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.ejs'),
      nodeModules: isDevMode
        ? path.resolve(__dirname, '../node_modules')
        : false,
    }),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env.PRODUCT_NAME': JSON.stringify(build.productName),
    }),
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, '../src/'),
      vue$: 'vue/dist/vue.common.js',
    },
    extensions: ['.js', '.vue', '.json', '.css', 'sass', 'scss', '.node'],
  },
  target: 'electron-renderer',
}

/**
 * Adjust rendererConfig for production settings
 */
if (isDevMode) {
  // any dev only config
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
} else {
  config.plugins.push(
    new ScriptExtHtmlWebpackPlugin({
      async: [/runtime/],
      defaultAttribute: 'defer',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new PurgecssPlugin({
      paths: fg.sync([`./src/renderer/**/*`], {
        onlyFiles: true,
        absolute: true,
      }),
    })
    // new CopyWebpackPlugin([
    //   {
    //     from: path.join(__dirname, '../src/data'),
    //     to: path.join(__dirname, '../dist/data'),
    //   },
    // ])
  )
}

module.exports = config
