# 📜 Database Changelog

This file serves as a record of all database schema changes, migrations, and updates applied throughout the project's lifecycle. Each change is logged with a timestamp, description, and migration file reference.

---

## 📌 Change Log Format

Each entry follows this structure:

- **Date**: YYYY-MM-DD
- **Description**: Short summary of the change
- **Migration File**: Name of the Django migration file
- **Impact**: Tables affected, potential data migration
- **Rollback Plan**: Steps to undo the change if needed

---

## 🔄 Migration History

### **Version: v1.4.1**
📅 **Date**: 2025-04-07
📝 **Description**: Enhanced user profiles with additional fields for personalization and preferences.

📂 **Migration File**: `users/migrations/0003_userprofile_bio_userprofile_birth_date_and_more.py`

🛠 **Impact**:
- Added biographical fields (`bio`, `birth_date`, `profile_image`, `phone_number`) to `UserProfile`.
- Added communication preference controls (`notification_preference`).
- Added marketing preference (`receive_marketing_emails`).
- Added display preference (`theme_preference`) to support light/dark mode.
- No data migration required as all fields are nullable with defaults.

🔄 **Rollback Plan**:
```bash
python manage.py migrate users 0002_address_userprofile_default_delivery_address   # Reverts to the previous migration
```

---

### **Version: v1.4.0**
📅 **Date**: 2025-04-07
📝 **Description**: Added default delivery address functionality to UserProfile.

📂 **Migration File**: `users/migrations/0002_address_userprofile_default_delivery_address.py`

🛠 **Impact**:
- Added `default_delivery_address` field to the `UserProfile` model as a ForeignKey to `Address`.
- This allows users to set a default delivery address for checkout.

🔄 **Rollback Plan**:
```bash
python manage.py migrate users 0001_initial   # Reverts to the previous migration
```

---

### **Version: v1.3.9**
📅 **Date**: 2025-04-07
📝 **Description**: Added initial user profile and address models to the `users` app.

📂 **Migration File**: `users/migrations/0001_initial.py`

🛠 **Impact**:
- Created `users_address` table to store user delivery addresses.
- Created `users_userprofile` table with basic user profile functionality.
- Established relationships between users and their profile information.

🔄 **Rollback Plan**:
```bash
python manage.py migrate users zero   # Reverts all migrations
```

---

### **Version: v1.3.10**
📅 **Date**: 2025-03-27
📝 **Description**: Added session_id field to the ComparisonList model to support anonymous comparisons.

📂 **Migration File**: `shop/migrations/0006_comparisonlist_session_id.py`

🛠 **Impact**:
- Added `session_id` field (CharField with max_length=255, nullable) to the `ComparisonList` model.
- This allows guests users without accounts to use product comparison features.
- No data migration required as the field is nullable.

🔄 **Rollback Plan**:
```bash
python manage.py migrate shop 0005_order_billing_name_order_payment_method_type_and_more   # Reverts to the previous migration
```

---

### **Version: v1.3.8**
📅 **Date**: 2025-03-27
📝 **Description**: Added billing name and payment method type to the Order model, and added an index to the RecentlyViewedItem model.

📂 **Migration File**: `shop/migrations/0005_order_billing_name_order_payment_method_type_and_more.py`

🛠 **Impact**:
- Added `billing_name` field to the `Order` model.
- Added `payment_method_type` field to the `Order` model.
- Added an index to the `RecentlyViewedItem` model: `shop_recent_user_prod_idx` on fields `user` and `product`.

🔄 **Rollback Plan**:
```bash
python manage.py migrate shop 0004_remove_payment_order_remove_wishlist_products_and_more   # Reverts to the previous migration
```

---

### **Version: v1.3.7**
📅 **Date**: 2025-03-26
📝 **Description**: Removed the `Payment` model, wishlist products, and session id. Altered various models and fields.

📂 **Migration File**: `shop/migrations/0004_remove_payment_order_remove_wishlist_products_and_more.py`

🛠 **Impact**:
- Removed the `Payment` model.
- Removed the `products` and `user` fields from the `Wishlist` model.
- Altered model options (verbose names, ordering) for various models.
- Removed constraints from `Cart`, `ComparisonList`, and `RecentlyViewedItem`.
- Removed fields from `ComparisonList`, `Order`, `OrderItem`, and `RecentlyViewedItem`.
- Added fields to `ComparisonList`, `Order`, and `WishlistItem`.
- Altered fields in various models.
- Removed the `WishList` model.
- Added a unique together constraint to `WishlistItem`.

🔄 **Rollback Plan**:
```bash
python manage.py migrate shop 0003_remove_order_shipping_address_order_billing_address1_and_more   # Reverts to the previous migration
```

---

### **Version: v1.3.6**
📅 **Date**: 2025-03-24
📝 **Description**: Added billing address fields, payment information, and shipping cost to the `Order` model. Created the `Payment` model.

📂 **Migration File**: `shop/migrations/0003_remove_order_shipping_address_order_billing_address1_and_more.py`

🛠 **Impact**:
- Removed `shipping_address` field from the `Order` model.
- Added billing address fields (`billing_address1`, `billing_address2`, `billing_city`, `billing_country`, `billing_state`, `billing_zipcode`) to the `Order` model.
- Added payment-related fields (`grand_total`, `original_cart`, `payment_intent_id`, `payment_method_id`, `payment_status`, `stripe_client_secret`) to the `Order` model.
- Added shipping address fields (`shipping_address1`, `shipping_address2`, `shipping_city`, `shipping_country`, `shipping_state`, `shipping_zipcode`, `shipping_cost`) to the `Order` model.
- Added `stripe_customer` field (ForeignKey to `djstripe.Customer`) to the `Order` model.
- Added `item_total` field to the `OrderItem` model.
- Altered the `status` field in the `Order` model to use a `CharField` with specific choices.
- Created a new `Payment` model with fields for `stripe_charge_id`, `amount`, `timestamp`, `status`, and a OneToOneField to `Order`.

🔄 **Rollback Plan**:
```bash
python manage.py migrate shop 0002_comparisonlist_recentlyvieweditem   # Reverts to the previous migration
```

---

### **Version: v1.3.5**
📅 **Date**: 2025-03-24
📝 **Description**: Added `ComparisonList` and `RecentlyViewedItem` models to the `shop` app.

📂 **Migration File**: `shop/migrations/0002_comparisonlist_recentlyvieweditem.py`

🛠 **Impact**:
- Created `shop_comparisonlist` table to store products being compared by users.
- Created `shop_recentlyvieweditem` table to track recently viewed products.

🔄 **Rollback Plan**:
```bash
python manage.py migrate shop 0001_initial   # Reverts to the previous migration
```

---

### **Version: v1.3.4**
📅 **Date**: 2025-03-24
📝 **Description**: Added `ProductAttribute`, `ProductAttributeType`, and `ProductAttributeValue` models to the `products` app.

📂 **Migration File**: `products/migrations/0003_productattributetype_alter_category_options_and_more.py`

🛠 **Impact**:
- Created `products_productattribute` table to store product attributes.
- Created `products_productattributetype` table to store product attribute types.
- Created `products_productattributevalue` table to store product attribute values.

🔄 **Rollback Plan**:
```bash
python manage.py migrate products 0002_product_compare_at_price   # Reverts to the previous migration
```

---

### **Version: v1.3.3**
📅 **Date**: 2025-03-23
📝 **Description**: Added `ComparisonList` and `RecentlyViewedItem` models to the `shop` app.

📂 **Migration File**: `shop/migrations/0002_comparisonlist_recentlyvieweditem.py`

🛠 **Impact**:
- Created `shop_comparisonlist` table to store products being compared by users.
- Created `shop_recentlyvieweditem` table to track recently viewed products.

🔄 **Rollback Plan**:
```bash
python manage.py migrate shop 0001_initial   # Reverts to the previous migration
```

---

### **Version: v1.3.2**
📅 **Date**: 2025-03-23
📝 **Description**: Added `compare_at_price` field to the `Product` model to support sale pricing and discount calculations.

📂 **Migration File**: `products/migrations/0002_product_compare_at_price.py`

🛠 **Impact**:
- Altered `products_product` table to add the `compare_at_price` column
- This allows products to display original prices alongside discounted prices
- No data migration required as the field is nullable

🔄 **Rollback Plan**:
```bash
python manage.py migrate products 0001_initial   # Reverts to the previous migration
```

---

### **Version: v1.3.1**
📅 **Date**: 2025-03-23
📝 **Description**: Added `compare_at_price` field to the `Product` model to support sale pricing and discount calculations.

📂 **Migration File**: `products/migrations/0002_product_compare_at_price.py`

🛠 **Impact**:
- Altered `products_product` table to add the `compare_at_price` column
- This allows products to display original prices alongside discounted prices
- No data migration required as the field is nullable

🔄 **Rollback Plan**:
```bash
python manage.py migrate products 0001_initial   # Reverts to the previous migration
```

---

### **Version: v1.3.0**
📅 **Date**: 2025-03-21
📝 **Description**: Initial migration for the `shop` app. This migration creates shopping cart, order management, and wishlist functionality with the following models: `Cart`, `CartItem`, `Order`, `OrderItem`, `WishList`, and `WishListItem`.

📂 **Migration File**: `shop/migrations/0001_initial.py`

🛠 **Impact**:
- Created `shop_cart` table with constraints to ensure either user_id or session_id is provided
- Created `shop_cartitem` table with unique constraint for cart-product combinations
- Created `shop_order` table for tracking customer purchases and payment status
- Created `shop_orderitem` table that stores product information at time of purchase
- Created `shop_wishlist` table for user's saved products
- Created `shop_wishlistitem` table with unique constraint for wishlist-product combinations
- Established relationships between users, products, carts, orders, and wishlists

🔄 **Rollback Plan**:
```bash
python manage.py migrate shop zero   # Reverts the initial migration
```

---

### **Version: v1.2.0**
📅 **Date**: 2025-02-16
📝 **Description**: Initial migration for the `products` app. This migration creates the `Category`, `Product`, `Review`, and `InventoryLog` models and their associated database tables.

📂 **Migration File**: `products/migrations/0001_initial.py`

🛠 **Impact**: Creates the `products_category`, `products_product`, `products_review`, and `products_inventorylog` tables in the database.

🔄 **Rollback Plan**:
```bash
python manage.py migrate products zero   # Reverts the initial migration
```

---

### **Version: v1.1.0**
📅 **Date**: 2024-07-27
📝 **Description**: Added support for user authentication via allauth.
📂 **Migration File**:
- `account`: `0001_initial` through `0009_emailaddress_unique_primary_email`
- `socialaccount`: `0001_initial` through `0006_alter_socialaccount_extra_data`
🛠 **Impact**:
- Created tables for allauth's user accounts, email addresses, and social account connections.
🔄 **Rollback Plan**:
```sh
python manage.py migrate account zero
python manage.py migrate socialaccount zero
```

---

### **Version: v1.0.0**
📅 **Date**: 2024-07-25
📝 **Description**: Initial database setup. Applied migrations for Django's built-in apps.
📂 **Migration File**:
- `admin`: `0001_initial`, `0002_logentry_remove_auto_add`, `0003_logentry_add_action_flag_choices`
- `auth`: `0001_initial` through `0012_alter_user_first_name_max_length`
- `contenttypes`: `0001_initial`, `0002_remove_content_type_name`
- `sessions`: `0001_initial`
🛠 **Impact**:
- Created tables for Django's authentication system, admin site, content types, and sessions.
🔄 **Rollback Plan**:
```sh
python manage.py migrate admin zero
python manage.py migrate auth zero
python manage.py migrate contenttypes zero
python manage.py migrate sessions zero
```

---

**Maintainer**: `@Hedgemonkey`
_Last updated: 2025-04-07_

---

## 🔍 Guidelines for Future Changes

✔ **Always document changes here before running `migrate` in production.**
✔ **Ensure backups are taken before applying schema updates.**
✔ **Use feature flags for risky migrations affecting live data.**
✔ **Test migrations in a staging environment before deploying.**

---

## 📌 Migration Tracking Commands

Check migration status:
```sh
python manage.py showmigrations
```

Apply migrations:
```sh
python manage.py migrate
```

Rollback to a previous migration:
```sh
python manage.py migrate app_name 0002
```
