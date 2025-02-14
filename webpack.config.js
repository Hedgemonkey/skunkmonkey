// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // Correct case

module.exports = {
  entry: {
    main: './static/js/main.js',      // Site-wide JS (including SweetAlert2)
    user_manage: './static/js/users/manage.js',  // User management JS (excluding SweetAlert2)
    styles: './static/css/main.css'  // Your main CSS entry point
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
