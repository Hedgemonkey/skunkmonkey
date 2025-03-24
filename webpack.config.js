// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    // Main entries
    'js/main': './static/js/main.js',
    'js/user/user_manage': './static/js/users/manage.js',
    'js/messages': './static/js/messages.js',
    
    // Styles
    'css/styles': [
      './node_modules/select2/dist/css/select2.css',
      './node_modules/select2-bootstrap-5-theme/dist/select2-bootstrap-5-theme.min.css',
      './static/css/main.css',
    ],
    
    // Product grid entries
    'js/product_grid': './static/js/product_grid.js',
    'css/product_grid': './static/css/product_grid.css',
    
    // Products app entries
    'js/products/products': './products/static/products/js/products.js',
    'js/products/cropper_init': './products/static/js/cropper_init.js',
    'js/products/filters': './products/static/js/filters.js',
    
    // Shop app entries
    'js/shop/cart': './shop/static/js/shop/cart-manager.js',
    'js/shop/catalog': './shop/static/js/shop/catalog-manager.js',
    'js/shop/wishlist': './shop/static/js/shop/wishlist-manager.js',
    'js/shop/wishlist-initializer': './shop/static/js/shop/wishlist-initializer.js', // New entry
    'js/shop/product-list': './shop/static/js/shop/product-list-manager.js',
    'js/shop/product-detail': './shop/static/js/shop/product-detail-manager.js',
    'js/shop/comparison-manager': './shop/static/js/shop/comparison-manager.js',
    
    // Shop CSS
    'css/shop': [
      './shop/static/css/shop/product-list.css',
      './shop/static/css/shop/product-detail.css', 
      './shop/static/css/shop/cart.css',
      './shop/static/css/shop/checkout.css',
      './shop/static/css/shop/order-complete.css',
      './shop/static/css/shop/order-history.css',
      './shop/static/css/shop/wishlist.css'
    ]
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
      filename: '[name].css',
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
