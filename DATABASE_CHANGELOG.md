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
