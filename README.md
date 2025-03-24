# SkunkMonkey E-Commerce Platform

SkunkMonkey is a **Django-based e-commerce platform** designed for seamless browsing, product discovery, secure transactions, and efficient order management. Built using **Agile methodologies**, the project follows a structured **KanBan** approach to ensure a smooth and organized development workflow.

Live Site: **[Coming Soon]**  
Test Credentials: **[To be added]**

---

## 📖 Contents

<details>
<summary>Click to expand Table of Contents</summary>

- [Project Goals](#project-goals)
- [Screenshots](#screenshots)
- [User Experience](#user-experience)
  - [Epics](#epics)
  - [User Stories](#user-stories)
  - [Site Structure](#site-structure)
    - [Wireframes](#wireframes)
    - [Database Schema](#database-schema)
  - [Design Choices](#design-choices)
- [Agile Project Management](#agile-project-management)
- [Features](#features)
- [Testing](#testing)
- [Validations](#validations)
- [Deployment](#deployment)
- [Credits](#credits)

</details>

---

## 🎯 Project Goals

The goal of **SkunkMonkey** is to build a **fully functional, scalable e-commerce platform** where users can **browse**, **search**, **purchase**, and **manage orders** efficiently. The platform will feature **user authentication, product browsing, shopping cart functionality, and an admin management system**.

This project is being built using **Django, PostgreSQL, and Bootstrap**, with an emphasis on **security, performance, and a mobile-friendly UI**.

[Back to top](#contents)

---

## 📸 Screenshots

### **Desktop View:**
| ![Placeholder](assets/img/desktop_view.jpg) |
|--------------------------------------------|

### **Mobile View:**
| ![Placeholder](assets/img/mobile_view.jpg) | ![Placeholder](assets/img/mobile_view_2.jpg) |
|------------------|------------------|

[Back to top](#contents)

---

## 🏗️ User Experience

### 📌 Epics

This project follows an **Agile development workflow**, structured around **GitHub KanBan**. Below are the main **epics**, each representing a key area of the project:

- **[Initialization & Django Setup](#)**
- **[User Registration & Authentication](#)**
- **[Product Browsing & Search](#)**
- **[Shopping Cart & Checkout](#)**
- **[Admin & Order Management](#)**
- **[UI/UX Design](#)**
- **[Marketing & SEO](#)**
- **[Deployment & Testing](#)**
- **[Database Design & Schema](#)**
- **[Project Documentation & README](#)**

### 📝 User Stories

Each **epic** is further broken down into **user stories**, detailing the features from the perspective of different users. A full list of user stories can be found on the **GitHub KanBan board**.

Here are a few **example user stories**:

- As a **visitor**, I want to **search for products using a keyword**, so that **I can quickly find specific items**.
- As a **registered user**, I want to **add items to my shopping cart**, so that **I can purchase them later**.
- As an **admin**, I want to **manage customer orders**, so that **I can process purchases efficiently**.

[Back to top](#contents)

---

## 🏗️ Site Structure

### **📐 Wireframes**
To plan the layout and user interface of the SkunkMonkey site, wireframes were designed using **Figma**. These wireframes outline the **mobile and desktop layouts**, ensuring a user-friendly experience across different devices.

📌 **View the full wireframe design on Figma:**  
🔗 [**SkunkMonkey Wireframes - Figma**](https://www.figma.com/design/NtLORpnMv7M6mVMJa75GGX/SkunkMonkey?node-id=1-589&t=N44x2kvD9axQSaAY-1)

#### **📱 Mobile Wireframe**
![Mobile Wireframe](readme/assets/mobile_wireframe.jpg)

#### **💻 Desktop Wireframe**
![Desktop Wireframe](readme/assets/desktop_wireframe.jpg)

[Back to top](#contents)

---

### 📄 Overview  

The SkunkMonkey site will be structured around the following pages:

- **Home Page** – Displays featured products, promotions, and categories.
- **Product Listings** – Browse products with search and filtering options.
- **Product Details** – View individual product information.
- **Shopping Cart** – Manage selected items before purchase.
- **Checkout** – Secure payment processing and order confirmation.
- **User Dashboard** – Manage orders, profile, and preferences.
- **Admin Panel** – Control products, users, and orders.

[Back to top](#contents)

---

## 🗄️ Database Schema & Migration Strategy

### 🔹 Database Schema Overview  
The database is designed using **PostgreSQL** and follows Django's **ORM** structure. Below is an overview of how data is structured. Note that this diagram does not represent all tables in the database. Additional tables manage user authentication, sessions, and social accounts.

```plaintext
+--------------------+         +--------------------+
|     Category       |         |      Product       |
+--------------------+         +--------------------+
| id (PK)            |         | id (PK)            |
| name               |         | name               |
| slug               |         | description        |
+--------------------+         | price              |
                               | category_id (FK)   |
                               | compare_at_price   |
                               | stock_quantity     |
                               | stock_quantity     |
                               | image              |
                               | created_at         |
                               | updated_at         |
                               | slug               |
                               | is_active          | 
                               +--------------------+
                                       |
                                       | 1:M
                                       v
+--------------------+         +----------------------+
| ProductAttribute   |<------> | ProductAttributeValue|
+--------------------+         +----------------------+
| id (PK)            |         | id (PK)              |
| product_id (FK)    |         | attribute_type_id(FK)|
| attribute_value_id(FK)|      | value                |
+--------------------+         +----------------------+
      ^                             ^
      |1:M                          |1:M
      |                             |
+--------------------+         +--------------------+
|      Product       |         |ProductAttributeType|
+--------------------+         +--------------------+
      |                        | id (PK)            |
      |                        | name               |
      |                        | display_name       |
      |                        +--------------------+
      |
      | 1:M
      v
+--------------------+         +--------------------+
|      Review        |         |   InventoryLog     |
+--------------------+         +--------------------+
| id (PK)            |         | id (PK)            |
| product_id (FK)    |         | product_id (FK)    |
| user_id (FK)       |         | change             |
| rating             |         | reason             |
| comment            |         | created_at         |
| created_at         |         +--------------------+
+--------------------+                 |
         |                             |
         | M:1                         | M:1
         v                             v
+--------------------+         +--------------------+
|       User         |<------- |  RecentlyViewedItem|
+--------------------+         +--------------------+
| id (PK)            |         |  id (PK)           |
| username           |         |  user_id (FK, opt) |
| email              |         |  session_id (opt)  |
| password           |         |  product_id (FK)  |
| ...                |         |  viewed_at         |
+--------------------+         +--------------------+
         ^
         |1:1
         |
+--------------------+         +--------------------+
|     ComparisonList |<-------  |      Product       |
+--------------------+         +--------------------+
| id (PK)            |         | id (PK)            |
| user_id (FK, opt)  |         | name               |
| session_id (opt)   |         | description        |
| created_at         |         | price              |
| updated_at         |         | category_id (FK)   |
+--------------------+         | compare_at_price   |
                               | stock_quantity     |
                               | image              |
                               | created_at         |
                               | updated_at         |
                               | slug               |
                               | is_active          |
                               +--------------------+
+--------------------+         +--------------------+
|       User         |<---+    |       Cart         |
+--------------------+    |    +--------------------+
| id (PK)            |    |    | id (PK)            |
| username           |    |    | user_id (FK, opt)  |
| email              |    |    | session_id (opt)   |
| password           |    |    | created_at         |
| ...                |    |    | updated_at         |
+--------------------+    |    +--------------------+
         ^                |            |
         |                |            | 1:M
         |                |            v
         |                |    +--------------------+
         |                |    |     CartItem       |
         |                |    +--------------------+
         |                |    | id (PK)            |
         |                |    | cart_id (FK)       |
         | 1:1            |    | product_id (FK)    |
         |                |    | quantity           |
+--------------------+    |    | added_at           |
|     WishList       |    |    | updated_at         |
+--------------------+    |    +--------------------+
| id (PK)            |    |
| user_id (FK)       |----+
| created_at         |
| updated_at         |
+--------------------+
         |
         | 1:M
         v
+--------------------+         +--------------------+
|   WishListItem     |         |       Order        |
+--------------------+         +--------------------+
| id (PK)            |         | id (PK)            |
| wishlist_id (FK)   |         | user_id (FK, opt)  |
| product_id (FK)    |         | full_name          |
| added_at           |         | email              |
+--------------------+         | shipping_address   |
                               | order_number       |
                               | status             |
                               | tracking_number    |
                               | total_price        |
                               | stripe_pid         |
                               | is_paid            |
                               | created_at         |
                               | updated_at         |
                               +--------------------+
                                        |
                                        | 1:M
                                        v
                               +--------------------+
                               |     OrderItem      |
                               +--------------------+
                               | id (PK)            |
                               | order_id (FK)      |
                               | product_id (FK)    |
                               | product_name       |
                               | price              |
                               | quantity           |
                               +--------------------+
```

### Key Relationships:

**Products Module:**
- `Category` ↔️ `Product`: One-to-Many (a category can have many products)  
- `Product` ↔️ `Review`: One-to-Many (a product can have many reviews)  
- `Product` ↔️ `InventoryLog`: One-to-Many (tracks stock changes over time)  
- `Review` ↔️ `User`: Many-to-One (a user can leave many reviews)

**Shop Module:**
- `User` ↔️ `Cart`: One-to-One (a user has one cart)
- `User` ↔️ `ComparisonList`: One-to-One (a user has one comparison list)
- `User` ↔️ `RecentlyViewedItem`: One-to-Many (a user can have many recently viewed items)
- `Product` ↔️ `ComparisonList`: Many-to-Many (a product can be in many comparison lists)
- `Product` ↔️ `RecentlyViewedItem`: One-to-Many (a product can be recently viewed by many users)
- `Cart` ↔️ `CartItem`: One-to-Many (a cart contains multiple items)
- `CartItem` ↔️ `Product`: Many-to-One (many cart items can reference the same product)
- `User` ↔️ `Order`: One-to-Many (a user can have many orders)
- `Order` ↔️ `OrderItem`: One-to-Many (an order contains multiple items)
- `OrderItem` ↔️ `Product`: Many-to-One (many order items can reference the same product)
- `User` ↔️ `WishList`: One-to-One (a user has one wishlist)
- `WishList` ↔️ `WishListItem`: One-to-Many (a wishlist contains multiple items)
- `WishListItem` ↔️ `Product`: Many-to-One (many wishlist items can reference the same product)

**Notable Features:**
- Carts can be associated with either registered users or anonymous sessions
- Orders store product information at time of purchase to maintain historical records
- Inventory is managed through both product stock levels and a log of changes
- Wishlists allow users to save products for future purchase
- Products now support a `compare_at_price` field to enable sale pricing and discount display (original price vs. current price)
- Comparison lists allow users to compare up to 4 products side-by-side
- Recently viewed items are tracked to provide personalized recommendations

The database consists of relational tables that store information about users, products, and orders. **Django's ORM** is used to interact with the database efficiently.

[Back to top](#contents)

---

### 🔹 Strategy for Schema Changes in Production  
Managing **schema changes** in a production environment requires careful planning to **minimize downtime** and **prevent data loss**. Below is the strategy we follow:

#### **1️⃣ Plan & Assess the Change**
- Identify **which tables and fields** will be modified.
- Determine **dependencies & constraints** (e.g., foreign keys).
- Choose an **appropriate migration strategy** (Zero-Downtime, Rolling Migration, etc.).

#### **2️⃣ Use Django Migrations**
All schema changes are managed through Django's built-in migration framework:
```
python manage.py makemigrations
python manage.py migrate
```
- Always **review** the generated migration file before applying it.
- Test migrations in a **staging environment** before running them in production.

#### **3️⃣ Ensure Safe Deployment**
**For small changes** (adding new columns):  
- **Deploy application changes first** before running the migration.
- Set **default values** for new columns to avoid breaking queries.

**For large changes** (removing columns, renaming tables):  
- Use a **rolling migration**:
  - Create a **new table** with the updated structure.
  - Gradually **migrate data**.
  - Update the **application to use the new table**.
  - Drop the old table once migration is complete.

#### **4️⃣ Backup Before Running Migrations**
Before applying schema changes, always **backup the database**:
```sh
pg_dump -U myuser -h mydbhost -d mydatabase -f backup.sql
```
- In case of failure, **restore the backup**:
  ```sh
  psql -U myuser -h mydbhost -d mydatabase -f backup.sql
  ```

#### **5️⃣ Apply Migrations in Production**
Once the migration is tested and confirmed:
```sh
python manage.py migrate
```
- Use `--fake-initial` if migrations were manually applied before:
  ```sh
  python manage.py migrate --fake-initial
  ```

#### **6️⃣ Monitor & Rollback if Needed**
- Monitor **database logs** and check for errors.
- If needed, **rollback the migration**:
  ```sh
  python manage.py migrate myapp 000x_previous_migration
  ```
- Keep rollback **scripts ready** for critical changes.

[Back to top](#contents)

---

## 📜 Database Change Log
All schema changes are documented in a structured manner for tracking purposes.

### 🔹 Template for Logging Database Changes
Each change is logged in `DATABASE_CHANGELOG.md` to keep track of modifications.

```
# 🛠️ Database Change Log

## 📅 [YYYY-MM-DD] - Migration 00XX_auto
### 📝 Summary:
- Added `new_field` to `users` table.
- Renamed `old_column` in `orders` table.
- Created new `payments` table.

### 🔄 Migration Commands:
python manage.py makemigrations
python manage.py migrate

### 🔄 Rollback Commands:
python manage.py migrate myapp 000x_previous_migration

### 🛠️ Reason for Change:
> The changes were introduced to improve scalability and add support for new features.

### 🔍 Impact & Dependencies:
- This affects **User Authentication** and **Order Processing** modules.
- Old API endpoints should be **deprecated** by next release.
```

[Back to top](#contents)

---

## 🔍 Querying Migration History
To check applied migrations in PostgreSQL:
```
SELECT * FROM django_migrations ORDER BY applied DESC;
```

To check **last migration applied**:
```
python manage.py showmigrations myapp
```

[Back to top](#contents)

---

## 🔄 Version Control & Documentation
- All migration files are **version-controlled** in Git.
- Commit messages follow this format:
  ```
  [DB] Added new payments table & updated user schema (#245)
  ```
- Release tags are used for **tracking major schema changes**:
  ```
  git tag -a v1.5.0 -m "Database migration for payments table"
  git push origin v1.5.0
  ```

[Back to top](#contents)

---

## ✅ Best Practices for Database Changes
✔ Always **plan and test** schema changes in a **staging environment**.  
✔ Use **Django migrations** instead of manual SQL changes.  
✔ Follow **zero-downtime or rolling migrations** for production databases.  
✔ Maintain a **backup before applying any changes**.  
✔ Keep detailed **logs & rollback strategies** for each migration.  

[Back to top](#contents)

---

## 🎨 Design Choices

### 🖋 Typography
The site will use **Google Fonts**:
- **Primary Font:** Roboto (for readability)
- **Secondary Font:** Raleway (for headings)

### 🎨 Colors
The project will use a **modern, clean color scheme** with a focus on contrast for readability.
```
:root {
  --primary-color: #4CAF50;
  --secondary-color: #2E7D32;
  --text-color: #212121;
}
```

[Back to top](#contents)

---

## 📌 Agile Project Management

This project is managed using **GitHub Projects** with a **KanBan board**, structured as follows:

- **Backlog** – Features planned for future development.
- **To Do** – Tasks that are ready for development.
- **In Progress** – Features currently being worked on.
- **In Review** – Features pending approval/testing.
- **Done** – Completed and deployed features.

You can view the **KanBan board here**: **[GitHub KanBan Board](#)**

[Back to top](#contents)

---

## ✅ Validations

All code is **linted and validated** using:
- **Pylint** for Python
- **W3C Validator** for HTML & CSS
- **ESLint** for JavaScript

[Back to top](#contents)

---

## 🚀 Deployment

### **Local Setup**
To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```sh
   git clone https://github.com/Hedgemonkey/skunkmonkey.git
   ```
2. **Navigate into the project directory**:
   ```sh
   cd skunkmonkey
   ```
3. **Create a virtual environment and activate it**:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On macOS/Linux
   venv\Scripts\activate     # On Windows
   ```
4. **Install dependencies**:
   ```sh
   pip install -r requirements.txt
   ```
5. **Set up the `.env` file** (Create a `.env` file and configure necessary environment variables such as `SECRET_KEY`, `DATABASE_URL`, etc.).
6. **Run database migrations**:
   ```sh
   python manage.py migrate
   ```
7. **Create a superuser for admin access**:
   ```sh
   python manage.py createsuperuser
   ```
8. **Start the development server**:
   ```sh
   python manage.py runserver
   ```
9. **Access the site** in your browser at:
   ```
   http://127.0.0.1:8000/
   ```

---

### **Production Deployment**
This project will be deployed to a **production server** using **one of the following platforms**:
- **Heroku**
- **AWS EC2**
- **DigitalOcean**
- **Railway.app**

#### **Planned Deployment Process**
1. **Containerization (Optional)**:
   - A `Dockerfile` and `docker-compose.yml` may be used for easy deployment.
3. **CI/CD Pipeline**:
   - GitHub Actions will be set up for automated testing and deployment.
4. **Environment Variables**:
   - Sensitive settings (e.g., `SECRET_KEY`, database credentials) will be stored in the **Heroku Config Vars** or an `.env` file in the server.
5. **PostgreSQL Database**:
   - A managed **PostgreSQL database** will be used for scalability.
