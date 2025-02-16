// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); 

module.exports = {
  entry: {
    main: './static/js/main.js',      // Site-wide JS (including SweetAlert2)
    user_manage: './static/js/users/manage.js',  // User management JS (excluding SweetAlert2)
    messages: './static/js/messages.js', // Entry for message handling
    styles: './static/css/main.css',  // Your main CSS entry point
    'products/js/products': './products/static/products/js/products.js',
  },
  output: {
    path: path.resolve(__dirname, 'static/bundles/'),  // Output path - MUST BE ABSOLUTE
    filename: 'js/[name].js',
    publicPath: '/static/bundles/',
  },
  module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
  plugins: [    //  <--- Move the plugin here
    new MiniCssExtractPlugin({
      filename: 'css/styles.css',
    }),
  ],

  optimization: {
    splitChunks: {   // This is the KEY change
      cacheGroups: {

      },
    },
  },
};
