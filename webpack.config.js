// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: {
    // Core entries
    'js/core/main': './static/js/main.js',
    
    // Common modules
    'js/common/image-cropper': './static/js/common/image_cropper.js',
    'js/common/api-client': './static/js/api-client.js', // Adding this as it's needed by checkout-manager.js
    
    // Home module
    'js/home/home': './home/static/js/home/home.js',
    
    // Product module
    'js/products/products': './products/static/products/js/products.js',
    'js/products/filters': './products/static/js/filters.js',
    'js/products/cropper-init': './products/static/js/cropper_init.js',
    'js/products/category-manager': './products/static/js/category-manager.js',
    'js/products/product-manager': './products/static/js/product-manager.js',
    'js/products/utilities/form-utils': './products/static/js/utilities/form-utils.js',
    'js/products/utilities/array-utils': './products/static/js/utilities/array-utils.js',
    'js/products/utilities/base-manager': './products/static/js/utilities/base-manager.js',
    'js/products/utilities/notifications': './products/static/js/utilities/notifications.js',
    'js/products/filters/category-filter-manager': './products/static/js/filters/category-filter-manager.js',
    'js/products/filters/filter-ui-manager': './products/static/js/filters/filter-ui-manager.js',
    
    // Shop module 
    'js/shop/cart-manager': './shop/static/js/shop/cart-manager.js',
    'js/shop/catalog-manager': './shop/static/js/shop/catalog-manager.js',
    'js/shop/wishlist-initializer': './shop/static/js/shop/wishlist-initializer.js',
    'js/shop/wishlist-manager': './shop/static/js/shop/wishlist-manager.js',
    'js/shop/product-list-manager': './shop/static/js/shop/product-list-manager.js',
    'js/shop/product-detail-manager': './shop/static/js/shop/product-detail-manager.js',
    'js/shop/comparison-manager': './shop/static/js/shop/comparison-manager.js',
    'js/shop/checkout': './shop/static/js/shop/checkout.js',
    'js/shop/checkout-manager': './shop/static/js/shop/checkout-manager.js',
    'js/shop/product-grid': './shop/static/js/shop/product-grid.js',
    'js/shop/product-filters': './shop/static/js/shop/product-filters.js',
    'js/shop/stripe-integration': './shop/static/js/shop/stripe-integration.js',
    'js/shop/utilities/notifications': './shop/static/js/utilities/notifications.js',
    
    // User module
    'js/users/profile': './users/static/users/js/users/profile.js',
    'js/users/profile-cropper': './users/static/users/js/users/profile_cropper.js',
    'js/users/profile-cropper-init': './users/static/users/js/users/profile_cropper_init.js',
    'js/users/account-actions': './users/static/users/js/users/account_actions.js',
    'js/users/address-management': './users/static/users/js/users/address-management.js',
    
    // CSS files - organized by module with clear paths
    'css/core': [
      './node_modules/select2/dist/css/select2.css',
      './node_modules/select2-bootstrap-5-theme/dist/select2-bootstrap-5-theme.min.css',
      './node_modules/@fortawesome/fontawesome-free/css/all.min.css',
      './static/css/main.css',
    ],
    'css/product-grid': './static/css/product_grid.css',
    'css/home': './home/static/css/home.css',
    'css/users/profile': './users/static/users/css/users/profile.css',
    'css/shop/cart': './shop/static/css/shop/cart.css',
    'css/shop/checkout': './shop/static/css/shop/checkout.css',
    'css/shop/product-detail': './shop/static/css/shop/product-detail.css',
    'css/shop/product-list': './shop/static/css/shop/product-list.css',
    'css/shop/order-complete': './shop/static/css/shop/order-complete.css',
    'css/shop/order-history': './shop/static/css/shop/order-history.css',
    'css/shop/stripe': './shop/static/css/shop/stripe.css',
    'css/shop/wishlist': './shop/static/css/shop/wishlist.css',
    
    // Vendor dependencies
    'js/vendors/libs': ['jquery', 'bootstrap', 'cropperjs', 'cropperjs/dist/cropper.min.css', '@fortawesome/fontawesome-free/js/all.min.js'],
  },
  output: {
    path: path.resolve(__dirname, 'static/bundles/'),
    filename: '[name].js',
    chunkFilename: 'js/chunks/[name].js',
    publicPath: '/static/bundles/',
    clean: true
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
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        type: 'asset/resource',
        generator: {
           filename: 'assets/fonts/[name][ext]'
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource',
        generator: {
           filename: 'assets/images/[name][ext]'
        }
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: 'css/chunks/[name].css',
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery',
      bootstrap: ['bootstrap/dist/js/bootstrap.bundle.js', 'default'],
      Cropper: 'cropperjs',
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            if (!module.context) {
              return 'js/vendors/misc';
            }
            
            const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
            if (!match || !match[1]) {
              return 'js/vendors/misc';
            }
            
            const packageName = match[1];
            return `js/vendors/${packageName.replace('@', '')}`;
          },
          chunks: 'all',
        },
      },
    },
  },
  resolve: {
    alias: {
      jquery: "jquery/src/jquery",
      // Add module aliases for easier imports between apps
      '@core': path.resolve(__dirname, 'static/js'),
      '@products': path.resolve(__dirname, 'products/static/js'),
      '@shop': path.resolve(__dirname, 'shop/static/js'),
      '@users': path.resolve(__dirname, 'users/static/users/js'),
      '@home': path.resolve(__dirname, 'home/static/js')
    },
    extensions: ['.js', '.jsx']
  },
  devtool: 'source-map',
};
