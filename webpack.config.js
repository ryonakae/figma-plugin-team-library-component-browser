/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  entry: {
    ui: './src/app/index.tsx', // The entry point for your UI code
    code: './src/plugin/controller.ts' // The entry point for your plugin code
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|bmp|gif|webp|svg)$/,
        loader: 'url-loader',
        options: {
          limit: undefined
        }
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'src')
    }
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: false,
        terserOptions: {
          warnings: false,
          compress: {
            drop_console: true
          },
          output: {
            comments: /@license/i
          }
        }
      })
    ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/app/index.html',
      filename: 'ui.html',
      inlineSource: '.(js)$',
      chunks: ['ui']
    }),
    new HtmlWebpackInlineSourcePlugin()
  ]
})
