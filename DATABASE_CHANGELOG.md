# 📜 Database Changelog  

This file serves as a record of all database schema changes, migrations, and updates applied throughout the project's lifecycle. Each change is logged with a **timestamp, description, and migration file reference**.

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
📅 **Date**: 2025-02-09  
📝 **Description**: Initial database setup with core tables  
📂 **Migration File**: `0001_initial.py`  
🛠 **Impact**:  
  - Created tables: `users`, `products`, `orders`, `reviews`  
  - Set up foreign key relationships  

🔄 **Rollback Plan**:  
```sh
python manage.py migrate app_name zero
```  

---

### **Version: v1.1.0**  
📅 **Date**: 2025-02-12  
📝 **Description**: Added support for user authentication  
📂 **Migration File**: `0002_add_auth.py`  
🛠 **Impact**:  
  - Added `is_verified` field to `users` table  
  - Created `password_resets` table  

🔄 **Rollback Plan**:  
```sh
python manage.py migrate app_name 0001
```  

---

### **Version: v1.2.0**  
📅 **Date**: 2025-02-15  
📝 **Description**: Introduced product categories & order status tracking  
📂 **Migration File**: `0003_product_categories.py`  
🛠 **Impact**:  
  - Added `categories` table  
  - Updated `orders` table to include `status` column  

🔄 **Rollback Plan**:  
```sh
python manage.py migrate app_name 0002
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
_Last updated: 2025-02-09_  
