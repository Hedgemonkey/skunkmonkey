import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: '/static/',
  build: {
    outDir: resolve(__dirname, '../static'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/core/js/main.js'),
        messages: resolve(__dirname, 'src/core/js/messages.js'),
        // Common modules
        imageCropper: resolve(__dirname, 'src/common/js/image_cropper.js'),
        apiClient: resolve(__dirname, 'src/common/js/api-client.js'),
        // Home
        home: resolve(__dirname, 'src/home/js/home.js'),
        // Products
        products: resolve(__dirname, 'src/products/js/products.js'),
        filters: resolve(__dirname, 'src/products/js/filters.js'),
        cropperInit: resolve(__dirname, 'src/products/js/cropper_init.js'),
        categoryManager: resolve(__dirname, 'src/products/js/category-manager.js'),
        productManager: resolve(__dirname, 'src/products/js/product-manager.js'),
        formUtils: resolve(__dirname, 'src/products/utilities/js/form-utils.js'),
        arrayUtils: resolve(__dirname, 'src/products/utilities/js/array-utils.js'),
        baseManager: resolve(__dirname, 'src/products/utilities/js/base-manager.js'),
        notifications: resolve(__dirname, 'src/products/utilities/js/notifications.js'),
        categoryFilterManager: resolve(__dirname, 'src/products/filters/js/category-filter-manager.js'),
        filterUiManager: resolve(__dirname, 'src/products/filters/js/filter-ui-manager.js'),
        // Shop
        cartManager: resolve(__dirname, 'src/shop/js/cart-manager.js'),
        catalogManager: resolve(__dirname, 'src/shop/js/catalog-manager.js'),
        wishlistInitializer: resolve(__dirname, 'src/shop/js/wishlist-initializer.js'),
        wishlistManager: resolve(__dirname, 'src/shop/js/wishlist-manager.js'),
        productListManager: resolve(__dirname, 'src/shop/js/product-list-manager.js'),
        productDetailManager: resolve(__dirname, 'src/shop/js/product-detail-manager.js'),
        comparisonManager: resolve(__dirname, 'src/shop/js/comparison-manager.js'),
        checkout: resolve(__dirname, 'src/shop/js/checkout.js'),
        checkoutManager: resolve(__dirname, 'src/shop/js/checkout-manager.js'),
        productGrid: resolve(__dirname, 'src/shop/js/product-grid.js'),
        productFilters: resolve(__dirname, 'src/shop/js/product-filters.js'),
        stripeIntegration: resolve(__dirname, 'src/shop/js/stripe-integration.js'),
        shopNotifications: resolve(__dirname, 'src/shop/utilities/js/notifications.js'),
        // Users
        profile: resolve(__dirname, 'src/users/js/profile.js'),
        profileCropper: resolve(__dirname, 'src/users/js/profile_cropper.js'),
        profileCropperInit: resolve(__dirname, 'src/users/js/profile_cropper_init.js'),
        profileImageManager: resolve(__dirname, 'src/users/js/profile_image_manager.js'),
        accountActions: resolve(__dirname, 'src/users/js/account_actions.js'),
        addressManagement: resolve(__dirname, 'src/users/js/address-management.js'),
      },
      output: {
        assetFileNames: (assetInfo) => {
          // Output CSS and JS to app-specific folders, fonts/images to assets
          if (assetInfo.name && assetInfo.type === 'asset' && assetInfo.name.endsWith('.css')) {
            // Handle CSS files imported from JS
            if (assetInfo.name.includes('products')) return `css/products/[name][extname]`;
            if (assetInfo.name.includes('shop')) return `css/shop/[name][extname]`;
            if (assetInfo.name.includes('users')) return `css/users/[name][extname]`;
            if (assetInfo.name.includes('home')) return `css/home/[name][extname]`;
            return `css/core/[name][extname]`;
          }
          if (assetInfo.name && assetInfo.name.match(/\.(woff2?|ttf|eot|otf)$/)) {
            // FontAwesome fonts go to webfonts directory, other fonts to fonts directory
            if (assetInfo.name && assetInfo.name.startsWith('fa-')) {
              return 'assets/webfonts/[name][extname]';
            }
            return 'assets/fonts/[name][extname]';
          }
          if (assetInfo.name && assetInfo.name.match(/\.(png|jpe?g|gif|webp|svg)$/)) {
            // FontAwesome SVGs go to webfonts directory, other images to images directory
            if (assetInfo.name && assetInfo.name.startsWith('fa-')) {
              return 'assets/webfonts/[name][extname]';
            }
            return 'assets/images/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name && chunkInfo.name.includes('products')) return 'js/products/[name].js';
          if (chunkInfo.name && chunkInfo.name.includes('shop')) return 'js/shop/[name].js';
          if (chunkInfo.name && chunkInfo.name.includes('users')) return 'js/users/[name].js';
          if (chunkInfo.name && chunkInfo.name.includes('home')) return 'js/home/[name].js';
          return 'js/core/[name].js';
        },
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name && chunkInfo.name.includes('products')) return 'js/products/[name].js';
          if (chunkInfo.name && chunkInfo.name.includes('shop')) return 'js/shop/[name].js';
          if (chunkInfo.name && chunkInfo.name.includes('users')) return 'js/users/[name].js';
          if (chunkInfo.name && chunkInfo.name.includes('home')) return 'js/home/[name].js';
          return 'js/core/[name].js';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@common': resolve(__dirname, 'src/common'),
      '@products': resolve(__dirname, 'src/products'),
      '@shop': resolve(__dirname, 'src/shop'),
      '@users': resolve(__dirname, 'src/users'),
      '@home': resolve(__dirname, 'src/home'),
      '@image_cropper': resolve(__dirname, 'src/common/js/image_cropper.js'),
      // Clean path alias for FontAwesome assets
      '@fortawesome': resolve(__dirname, '../node_modules/@fortawesome'),
    },
    extensions: ['.js', '.jsx', '.json'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    origin: 'http://hedgemonkey.ddns.net:5173',
    cors: true,
    fs: {
      allow: ['..'],
    },
  },
  plugins: [
    {
      name: 'django-vite-asset-resolver',
      configureServer(server) {
        // Use server.middlewares.use directly instead of returning a function
        server.middlewares.use((req, res, next) => {
          console.log(`[django-vite] Request received: ${req.url}`);
          try {
            // Parse the URL properly
            const url = new URL(req.url, 'http://localhost');
            // Remove leading slash and handle /static/ prefix
            let path = url.pathname.replace(/^\//, '').replace(/^static\//, '');

            // Handle both with and without file extension
            // Extract the base name without extension
            const baseName = path.split('.')[0];

            const entryPointMap = {
                // JS files
                'main': '/static/src/core/js/main.js',
                'messages': '/static/src/core/js/messages.js',
                'products': '/static/src/products/js/products.js',
                'filters': '/static/src/products/js/filters.js',
                'cropperInit': '/static/src/products/js/cropper_init.js',
                'categoryManager': '/static/src/products/js/category-manager.js',
                'productManager': '/static/src/products/js/product-manager.js',
                'formUtils': '/static/src/products/utilities/js/form-utils.js',
                'arrayUtils': '/static/src/products/utilities/js/array-utils.js',
                'baseManager': '/static/src/products/utilities/js/base-manager.js',
                'notifications': '/static/src/products/utilities/js/notifications.js',
                'categoryFilterManager': '/static/src/products/filters/js/category-filter-manager.js',
                'filterUiManager': '/static/src/products/filters/js/filter-ui-manager.js',
                'cartManager': '/static/src/shop/js/cart-manager.js',
                'catalogManager': '/static/src/shop/js/catalog-manager.js',
                'wishlistInitializer': '/static/src/shop/js/wishlist-initializer.js',
                'wishlistManager': '/static/src/shop/js/wishlist-manager.js',
                'productListManager': '/static/src/shop/js/product-list-manager.js',
                'productDetailManager': '/static/src/shop/js/product-detail-manager.js',
                'comparisonManager': '/static/src/shop/js/comparison-manager.js',
                'checkout': '/static/src/shop/js/checkout.js',
                'checkoutManager': '/static/src/shop/js/checkout-manager.js',
                'productGrid': '/static/src/shop/js/product-grid.js',
                'productFilters': '/static/src/shop/js/product-filters.js',
                'stripeIntegration': '/static/src/shop/js/stripe-integration.js',
                'shopNotifications': '/static/src/shop/utilities/js/notifications.js',
                'profile': '/static/src/users/js/profile.js',
                'profileCropper': '/static/src/users/js/profile_cropper.js',
                'profileCropperInit': '/static/src/users/js/profile_cropper_init.js',
                'profileImageManager': '/static/src/users/js/profile_image_manager.js',
                'accountActions': '/static/src/users/js/account_actions.js',
                'addressManagement': '/static/src/users/js/address-management.js',
                'imageCropper': '/static/src/common/js/image_cropper.js',
                'apiClient': '/static/src/common/js/api-client.js',
                'home': '/static/src/home/js/home.js',

                // CSS files
                'mainStyle': '/static/src/core/css/main.css',
                'categoryTagsStyle': '/static/src/products/css/category-tags.css',
                'filterButtonsStyle': '/static/src/products/css/filter-buttons.css',
                'productGridStyle': '/static/src/products/css/product_grid.css',
                'productCardButtonsStyle': '/static/src/products/css/product-card-buttons.css',
                'select2CustomStyle': '/static/src/products/css/select2-custom.css',
                'cartStyle': '/static/src/shop/css/cart.css',
                'checkoutStyle': '/static/src/shop/css/checkout.css',
                'orderCompleteStyle': '/static/src/shop/css/order-complete.css',
                'orderHistoryStyle': '/static/src/shop/css/order-history.css',
                'productDetailStyle': '/static/src/shop/css/product-detail.css',
                'productListStyle': '/static/src/shop/css/product-list.css',
                'stripeStyle': '/static/src/shop/css/stripe.css',
                'wishlistStyle': '/static/src/shop/css/wishlist.css',
                'profileStyle': '/static/src/users/css/profile.css'
              };

              // Check if the exact path or the base name matches one of our entry points
              if (entryPointMap[path]) {
                console.log(`[django-vite] Rewriting exact match: ${req.url} → ${entryPointMap[path]}`);
                req.url = entryPointMap[path];
                return next();
              }

              // Check if we should match by the base name (without extension)
              if (entryPointMap[baseName]) {
                console.log(`[django-vite] Rewriting base match: ${req.url} → ${entryPointMap[baseName]}`);
                req.url = entryPointMap[baseName];
                return next();
              }

              console.log(`[django-vite] No match found for: ${path} (basename: ${baseName})`);
            } catch (e) {
              console.error('[django-vite] Middleware error:', e);
            }

            next();
          });
      }
    }
  ]
});
