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

---

**Maintainer**: `@Hedgemonkey`  
_Last updated: 2025-03-23_

---

### **Version: v1.3.2**
📅 **Date**: 2025-03-23
📝 **Description**: Updated database schema to include the `compare_at_price` field in the `Product` model.

📂 **Migration File**: `products/migrations/0002_product_compare_at_price.py`

🛠 **Impact**:
- Added `compare_at_price` field to the `products_product` table.
- No data migration required.

🔄 **Rollback Plan**:
```bash
python manage.py migrate products 0001_initial   # Reverts to the previous migration
```

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

---

**Maintainer**: `@Hedgemonkey`
_Last updated: 2025-03-23_

