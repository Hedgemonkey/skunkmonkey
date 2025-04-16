// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const fs = require('fs');

// Define JS and CSS entries separately for better organization
const jsEntries = {
  // Core entries
  'js/core/main': './static/js/main.js',
  'js/core/messages': './static/js/messages.js',

  // Common modules
  'js/common/image-cropper': './static/js/common/image_cropper.js',
  'js/common/api-client': './static/js/api-client.js',

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

  // Vendor dependencies
  'js/vendors/libs': [
    'jquery',
    'bootstrap/dist/js/bootstrap.bundle.js',
    'cropperjs',
    'cropperjs/dist/cropper.min.css',
    '@fortawesome/fontawesome-free/js/all.min.js'
  ],
};

const cssEntries = {
  // Core CSS
  'css/core/main': [
    './node_modules/select2/dist/css/select2.css',
    './node_modules/select2-bootstrap-5-theme/dist/select2-bootstrap-5-theme.min.css',
    './node_modules/@fortawesome/fontawesome-free/css/all.min.css',
    './static/css/main.css',
  ],
  // Products CSS - moved from static to products app directory
  'css/products/product-grid': './products/static/css/products/product_grid.css',
  // Home module CSS
  'css/home/main': './home/static/css/home.css',
  // Users module CSS
  'css/users/profile': './users/static/users/css/users/profile.css',
  // Shop module CSS
  'css/shop/cart': './shop/static/css/shop/cart.css',
  'css/shop/checkout': './shop/static/css/shop/checkout.css',
  'css/shop/product-detail': './shop/static/css/shop/product-detail.css',
  'css/shop/product-list': './shop/static/css/shop/product-list.css',
  'css/shop/order-complete': './shop/static/css/shop/order-complete.css',
  'css/shop/order-history': './shop/static/css/shop/order-history.css',
  'css/shop/stripe': './shop/static/css/shop/stripe.css',
  'css/shop/wishlist': './shop/static/css/shop/wishlist.css',
};

// Custom plugin to remove JS files created for CSS entries
class RemoveCssJsFilesPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('RemoveCssJsFilesPlugin', (compilation) => {
      const outputPath = compilation.outputOptions.path;

      // Remove CSS-generated JS files and their maps
      Object.keys(cssEntries).forEach(entryName => {
        const jsFile = path.join(outputPath, `${entryName}.js`);
        const mapFile = path.join(outputPath, `${entryName}.js.map`);

        if (fs.existsSync(jsFile)) {
          fs.unlinkSync(jsFile);
          console.log(`Removed: ${jsFile}`);
        }

        if (fs.existsSync(mapFile)) {
          fs.unlinkSync(mapFile);
          console.log(`Removed: ${mapFile}`);
        }
      });
    });
  }
}

module.exports = {
  mode: 'development',
  entry: { ...jsEntries, ...cssEntries },
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
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          }
        ],
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
           filename: 'assets/fonts/[name][ext][query]'
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
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery',
      bootstrap: ['bootstrap/dist/js/bootstrap.bundle.js', 'default'],
      Cropper: 'cropperjs',
      'window.Cropper': 'cropperjs',
      ImageCropper: [path.resolve(__dirname, 'static/js/common/image_cropper.js'), 'default'],
      'window.ImageCropper': [path.resolve(__dirname, 'static/js/common/image_cropper.js'), 'default']
    }),
    new RemoveCssJsFilesPlugin()
  ],
  optimization: {
    splitChunks: {
      chunks: chunk => !chunk.name || !chunk.name.startsWith('css/'),
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
          chunks: chunk => !chunk.name || !chunk.name.startsWith('css/'),
        },
        appChunks: {
          test: /[\\/](products|shop|users|home|static)[\\/]/,
          name(module) {
            const moduleFile = module.resource || '';
            const appMatch = moduleFile.match(/[\\/](products|shop|users|home|static)[\\/]/);
            if (!appMatch) return 'js/chunks/misc';

            const app = appMatch[1];
            const filename = moduleFile.split('/').pop().replace(/\.\w+$/, '');
            return `js/${app}/chunks/${filename}`;
          },
          chunks: chunk => !chunk.name || !chunk.name.startsWith('css/'),
          priority: 9
        }
      },
    },
  },
  resolve: {
    alias: {
      jquery: "jquery/src/jquery",
      '@core': path.resolve(__dirname, 'static/js'),
      '@products': path.resolve(__dirname, 'products/static/js'),
      '@shop': path.resolve(__dirname, 'shop/static/js'),
      '@users': path.resolve(__dirname, 'users/static/users/js'),
      '@home': path.resolve(__dirname, 'home/static/js'),
      // Explicitly define the image_cropper path for direct imports
      '@image_cropper': path.resolve(__dirname, 'static/js/common/image_cropper.js'),
      // Add additional aliases to help resolve path issues
      'static/js/common/image_cropper.js': path.resolve(__dirname, 'static/js/common/image_cropper.js')
    },
    extensions: ['.js', '.jsx']
  },
  devtool: 'source-map',
};
