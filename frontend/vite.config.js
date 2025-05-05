import { defineConfig } from 'vite';
import { resolve } from 'path';

// Base path when deployed on DirectAdmin
const basePath = process.env.NODE_ENV === 'production' ? '/dev/static/' : '/';

export default defineConfig({
  base: basePath,
  build: {
    outDir: '../staticfiles',
    assetsDir: '',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/core/js/main.js'),
        home: resolve(__dirname, 'src/home/js/home.js'),
        // Common modules
        imageCropper: resolve(__dirname, 'src/common/js/image_cropper.js'),
        apiClient: resolve(__dirname, 'src/common/js/api-client.js'),
        // Products
        products: resolve(__dirname, 'src/products/js/products.js'),
        filters: resolve(__dirname, 'src/products/js/filters.js'),
        cropperInit: resolve(__dirname, 'src/products/js/cropper_init.js'),
        categoryManager: resolve(__dirname, 'src/products/js/category-manager.js'),
        productsManager: resolve(__dirname, 'src/products/js/product-manager.js'),
        formUtils: resolve(__dirname, 'src/products/utilities/js/form-utils.js'),
        arrayUtils: resolve(__dirname, 'src/products/utilities/js/array-utils.js'),
        baseManager: resolve(__dirname, 'src/products/utilities/js/base-manager.js'),
        notifications: resolve(__dirname, 'src/products/utilities/js/notifications.js'),
        categoryFilterManager: resolve(
          __dirname, 'src/products/filters/js/category-filter-manager.js'
        ),
        filterUiManager: resolve(
          __dirname, 'src/products/filters/js/filter-ui-manager.js'
        ),
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
        profileImageManager: resolve(__dirname, 'src/users/js/profile_image_manager.js'),
        accountActions: resolve(__dirname, 'src/users/js/account_actions.js'),
        addressManagement: resolve(__dirname, 'src/users/js/address-management.js'),
        // Staff - new entries
        staff: resolve(__dirname, 'src/staff/js/staff.js'),
        orderManager: resolve(__dirname, 'src/staff/js/order-manager.js'),
        staffProductManager: resolve(__dirname, 'src/staff/js/product-manager.js'),
        productDashboard: resolve(__dirname, 'src/staff/js/product-dashboard.js'),
        productEditor: resolve(__dirname, 'src/staff/js/product-editor.js'),
      },
      output: {
        // Output format for production builds
        entryFileNames: 'js/[name]/[name].js',
        chunkFileNames: 'js/[name]/chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];

          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
            return 'img/[name]-[hash][extname]';
          }

          if (/\.(css)$/.test(assetInfo.name)) {
            return 'css/[name]/[name][extname]';
          }

          return 'assets/[name]-[hash][extname]';
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    // Dev server settings
    port: 5173,
    open: false,
    strictPort: true,
    origin: 'http://localhost:5173'
  }
});
