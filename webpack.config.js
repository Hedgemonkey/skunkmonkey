// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
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
    
    // Home page entries
    'js/home': './home/static/js/home/home.js',
    'css/home': './home/static/css/home.css',
    
    // Product grid CSS (keeping the CSS entry)
    'css/product_grid': './static/css/product_grid.css',
    
    // Products app entries
    'js/products/products': './products/static/products/js/products.js',
    'js/products/cropper_init': './products/static/js/cropper_init.js',
    'js/products/filters': './products/static/js/filters.js',
    
    // Shop app entries
    'js/shop/cart': './shop/static/js/shop/cart-manager.js',
    'js/shop/catalog': './shop/static/js/shop/catalog-manager.js',
    'js/shop/wishlist': './shop/static/js/shop/wishlist-initializer.js', // Fixed: Using initializer as entry point
    'js/shop/product-list': './shop/static/js/shop/product-list-manager.js',
    'js/shop/product-detail': './shop/static/js/shop/product-detail-manager.js',
    'js/shop/comparison-manager': './shop/static/js/shop/comparison-manager.js',
    'js/shop/checkout': './shop/static/js/shop/checkout.js',
    'js/shop/product-grid': './shop/static/js/shop/product-grid.js', // Added proper entry for product-grid.js
    
    // Shop CSS
    'css/shop': [
      './shop/static/css/shop/product-list.css',
      './shop/static/css/shop/product-detail.css', 
      './shop/static/css/shop/cart.css',
      './shop/static/css/shop/checkout.css',
      './shop/static/css/shop/order-complete.css',
      './shop/static/css/shop/order-history.css',
      // './shop/static/css/shop/wishlist.css', // Removed from here
      './shop/static/css/shop/stripe.css'
    ],

    // --- NEW ENTRY FOR WISHLIST CSS ---
    'css/shop/wishlist': './shop/static/css/shop/wishlist.css', // Added separate entry

    // --- User Profile Entries (Corrected Paths) ---
    'js/profile': './users/static/users/js/profile.js',       // CORRECTED JS entry path
    'css/profile': './users/static/users/css/profile.css',   // CORRECTED CSS entry path

  },
  output: {
    path: path.resolve(__dirname, 'static/bundles/'), // Output directory for bundles
    filename: '[name].js',                            // Output JS filename pattern
    publicPath: '/static/bundles/',                   // Public path for accessing bundles
    clean: true, // Clean the output directory before emit
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
      // Add loaders for fonts or images if needed
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        type: 'asset/resource',
        generator: {
           filename: 'fonts/[hash][ext][query]' // Output fonts to a fonts subdirectory
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource',
        generator: {
           filename: 'images/[hash][ext][query]' // Output images to an images subdirectory
        }
      }
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
    },
    extensions: ['.js', '.jsx'] // Allow importing JS/JSX without extension
  },
  devtool: 'source-map', // Add source maps for easier debugging
};
