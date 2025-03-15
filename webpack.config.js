// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    'js/main': './static/js/main.js',
    'js/user_manage': './static/js/users/manage.js',
    'js/messages': './static/js/messages.js',
    styles: [
      './static/css/main.css',
      './node_modules/select2/dist/css/select2.css',
      './node_modules/select2-bootstrap-5-theme/dist/select2-bootstrap-5-theme.min.css'
    ],
    'js/products/products': './products/static/products/js/products.js',
    'js/cropper_init': './products/static/js/cropper_init.js',
    'js/filters': './products/static/js/filters.js',
  },
  output: {
    path: path.resolve(__dirname, 'static/bundles/'),
    filename: '[name].js',
    publicPath: '/static/bundles/',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {},
    },
  },
  resolve: {
    alias: {
      jquery: "jquery/src/jquery"
    }
  }
};