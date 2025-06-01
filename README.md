# SkunkMonkey E-Commerce Platform

SkunkMonkey is a **Django-based e-commerce platform** designed for seamless
browsing, product discovery, secure transactions, and efficient order management.
Built using **Agile methodologies**, the project follows a structured **KanBan**
approach to ensure a smooth and organized development workflow.

🌐 **Live Site:** [https://skunkmonkey-225daa98122d.herokuapp.com/](https://skunkmonkey-225daa98122d.herokuapp.com/)

📘 **Facebook Page:** [https://www.facebook.com/profile.php?id=61575805709524](https://www.facebook.com/profile.php?id=61575805709524)

🔑 **Test Credentials:**
- **Admin Account:** `admin@skunkmonkey.com` / `TestAdmin123!`
- **Test Customer:** `customer@test.com` / `TestCustomer123!`
- **Stripe Test Card:** `4242 4242 4242 4242` (Any future date, any CVC)

> **Note:** Social media links in the footer are currently placeholders and will be updated with actual business profiles as they become available.

---

## 📖 Contents

- [Project Goals](#-project-goals)
- [Screenshots](#-screenshots)
- [User Experience](#-user-experience)
  - [Epics](#-epics)
  - [User Stories](#-user-stories)
  - [Site Structure](#-site-structure)
    - [Wireframes](#-wireframes)
    - [Database Schema](#-database-schema)
  - [Design Choices](#-design-choices)
- [Agile Project Management](#-agile-project-management)
- [Marketing Strategy](#-marketing-strategy)
- [Features](#-features)
- [Testing](#-testing)
- [Validations](#-validations)
- [Deployment](#-deployment)
- [Credits](#-credits)

---

## 🎯 Project Goals

The goal of **SkunkMonkey** is to build a **fully functional, scalable
e-commerce platform** where users can **browse**, **search**, **purchase**, and
**manage orders** efficiently. The platform will feature **user authentication,
product browsing, shopping cart functionality, and an admin management system**.

This project is being built using **Django, PostgreSQL, Vite, and Bootstrap**,
with an emphasis on **security, performance, and a mobile-friendly UI**. The
frontend assets are managed through **Vite**, providing faster build times and
an improved development experience.

[Back to top](#-contents)

---

## 📸 Screenshots

### **Desktop View:**

| ![SkunkMonkey Desktop Homepage](readme/assets/skunkmonkey_home.jpg) |
|----------------------------------------------------------------------|
| *Homepage featuring product categories, featured products, and promotional banners*                                     |

| ![SkunkMonkey Product Catalog](readme/assets/skunkmonkey_shop.jpg) |
|--------------------------------------------------------------------|
| *Product catalog with advanced filtering, search, and sorting capabilities*                                           |

| ![SkunkMonkey Shopping Cart](readme/assets/skunkmonkey_cart.jpg) |
|-------------------------------------------------------------------|
| *Shopping cart and secure checkout process with Stripe integration*                                                |

### **Mobile View:**

| ![SkunkMonkey Mobile Homepage](readme/assets/skunkmonkey_mobile_home.jpg) | ![SkunkMonkey Mobile Menu](readme/assets/skunkmonkey_mobile_navigation.jpg) |
|---------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| *Mobile-responsive homepage design*                                                                    | *Mobile navigation and category browsing*                                                            |

| ![SkunkMonkey Mobile Product](readme/assets/skunkmonkey_mobile_product_detail.jpg) | ![SkunkMonkey Mobile Cart](readme/assets/skunkmonkey_mobile_cart.jpg) |
|------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| *Mobile product detail view*                                                                         | *Mobile shopping cart interface*                                                                 |

### **Admin Dashboard:**

| ![SkunkMonkey Admin Dashboard](readme/assets/skunkmonkey_admin_dashboard.jpg) |
|-------------------------------------------------------------------------------|
| *Main admin dashboard with sales analytics and system overview*                                     |

| ![SkunkMonkey Orders Dashboard](readme/assets/skunkmonkey_orders_dashboard.jpg) |
|---------------------------------------------------------------------------------|
| *Orders management dashboard with order processing and status tracking*                                     |

| ![SkunkMonkey Products Dashboard](readme/assets/skunkmonkey_products_dashboard.jpg) |
|-------------------------------------------------------------------------------------|
| *Products management dashboard with inventory control and product statistics*                                     |

### **Social Media Presence:**

| ![SkunkMonkey Facebook Page](readme/assets/skunkmonkey_facebook.jpg) |
|----------------------------------------------------------------------|
| *Official SkunkMonkey Facebook business page for community engagement and marketing*                                     |

[Back to top](#-contents)

---

## 🏗️ User Experience

### 📌 Epics

This project follows an **Agile development workflow**, structured around
**GitHub KanBan**. Below are the main **epics**, each representing a key area
of the project:

- **[Initialization & Django Setup](https://github.com/users/Hedgemonkey/projects/3/)**
- **[User Registration & Authentication](https://github.com/users/Hedgemonkey/projects/3/)**
- **[Product Browsing & Search](https://github.com/users/Hedgemonkey/projects/3/)**
- **[Shopping Cart & Checkout](https://github.com/users/Hedgemonkey/projects/3/)**
- **[Admin & Order Management](https://github.com/users/Hedgemonkey/projects/3/)**
- **[UI/UX Design](https://github.com/users/Hedgemonkey/projects/3/)**
- **[Marketing & SEO](https://github.com/users/Hedgemonkey/projects/3/)**
- **[Deployment & Testing](https://github.com/users/Hedgemonkey/projects/3/)**
- **[Database Design & Schema](https://github.com/users/Hedgemonkey/projects/3/)**
- **[Project Documentation & README](https://github.com/users/Hedgemonkey/projects/3/)**

### 📝 User Stories

Each **epic** is further broken down into **user stories**, detailing the
features from the perspective of different users. A full list of user stories
can be found on the **GitHub KanBan board**.

Here are a few **example user stories**:

- As a **visitor**, I want to **search for products using a keyword**, so that
  **I can quickly find specific items**.
- As a **registered user**, I want to **add items to my shopping cart**, so that
  **I can purchase them later**.
- As an **admin**, I want to **manage customer orders**, so that **I can process
  purchases efficiently**.

[Back to top](#-contents)

---

## 🏗️ Site Structure

### **📐 Wireframes**

To plan the layout and user interface of the SkunkMonkey site, wireframes were
designed using **Figma**. These wireframes outline the **mobile and desktop
layouts**, ensuring a user-friendly experience across different devices.

📌 **View the full wireframe design on Figma:**
🔗 [**SkunkMonkey Wireframes - Figma**](https://www.figma.com/design/NtLORpnMv7M6mVMJa75GGX/SkunkMonkey?node-id=1-589&t=N44x2kvD9axQSaAY-1)

#### **📱 Mobile Wireframe**

![Mobile Wireframe](readme/assets/mobile_wireframe.jpg)

#### **💻 Desktop Wireframe**

![Desktop Wireframe](readme/assets/desktop_wireframe.jpg)

[Back to top](#-contents)

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

[Back to top](#-contents)

---

## 🗄️ Database Schema & Migration Strategy

### 🔹 Database Schema Overview

The database is designed using **PostgreSQL** and follows Django's **ORM**
structure. Below is an overview of how data is structured. Note that this
diagram does not represent all tables in the database. Additional tables manage
user authentication, sessions, and social accounts.

```text
+--------------------+         +--------------------+
|     Category       |         |      Product       |
+--------------------+         +--------------------+
| id (PK)            |         | id (PK)            |
| name               |         | name               |
| slug               |         | slug               |
| parent (FK, self)  |         | description        |
| level              |         | price              |
| order              |         | compare_at_price   |
| friendly_name      |         | stock_quantity     |
| image              |         | image              |
| is_active          |         | created_at         |
+--------------------+         | updated_at         |
      ^                        | is_active          |
      | 1:M                    | category_id (FK)   |
      |                        +--------------------+
      v                                  |
+--------------------+                   | 1:M
|     Product        |                   v
+--------------------+         +--------------------+
                               | ProductAttribute   |
+--------------------+         +--------------------+
| ProductAttribute   |         | id (PK)            |
+--------------------+         | product_id (FK)    |
| id (PK)            |<--------| attribute_value_id |
| product_id (FK)    |         +--------------------+
| attribute_value_id |                   ^
+--------------------+                   | 1:M
                                         |
                               +--------------------+
                               |ProductAttributeValue|
                               +--------------------+
                               | id (PK)            |
                               | attribute_type_id(FK)|
                               | value              |
                               +--------------------+
                                         ^
                                         | 1:M
                                         |
                               +--------------------+
                               |ProductAttributeType|
                               +--------------------+
                               | id (PK)            |
                               | name               |
                               | display_name       |
                               +--------------------+
```

Additional models and relationships:

```text
+--------------------+         +--------------------+
|      Review        |         |   InventoryLog     |
+--------------------+         +--------------------+
| id (PK)            |         | id (PK)            |
| product_id (FK)    |         | product_id (FK)    |
| user_id (FK)       |         | change             |
| rating             |         | reason             |
| comment            |         | created_at         |
| created_at         |         +--------------------+
+--------------------+
```

User, address, and contact models:

```text
+--------------------+         +--------------------+         +--------------------+
|     UserProfile    |         |       User         |         |   ContactMessage   |
+--------------------+         +--------------------+         +--------------------+
| id (PK)            |<--------| id (PK)            |         | id (PK)            |
| user_id (FK)       |         | username           |-------->| user_id (FK, opt)  |
| bio                |         | email              |         | email              |
| birth_date         |         | password           |         | subject            |
| profile_image      |         | ...                |-------->| message            |
| phone_number       |         +--------------------+         | phone_number       |
| theme_preference   |                 |                      | timestamp          |
| notification_pref  |                 | 1:M                  | is_read            |
| marketing_emails   |                 v                      | status             |
| default_del_addr(FK)|        +--------------------+         | priority           |
+--------------------+         |      Address       |         | category           |
                               +--------------------+         | assigned_to (FK)   |
                               | id (PK)            |         | staff_notes        |
                               | user_id (FK)       |         | response           |
                               | name               |         | response_date      |
                               | address_line1      |         | resolved_date      |
                               | address_line2      |         +--------------------+
                               | city               |
                               | state              |
                               | postal_code        |
                               | country            |
                               | phone_number       |
                               | is_default         |
                               | created_at         |
                               | updated_at         |
                               +--------------------+
```

Shopping related models:

```text
+--------------------+         +--------------------+
|   WishlistItem     |         |RecentlyViewedItem  |
+--------------------+         +--------------------+
| id (PK)            |         | id (PK)            |
| user_id (FK)       |         | user_id (FK)       |
| product_id (FK)    |         | product_id (FK)    |
| added_at           |         | viewed_at          |
+--------------------+         +--------------------+

+--------------------+         +--------------------+
|   ComparisonList   |         |       Cart         |
+--------------------+         +--------------------+
| id (PK)            |         | id (PK)            |
| user_id (FK, opt)  |         | user_id (FK, opt)  |
| session_id (opt)   |         | session_id (opt)   |
| name               |         | created_at         |
| created_at         |         | updated_at         |
+--------------------+         +--------------------+
        |                               |
        | M:M                           | 1:M
        v                               v
+--------------------+         +--------------------+
|      Product       |         |     CartItem       |
+--------------------+         +--------------------+
                               | id (PK)            |
                               | cart_id (FK)       |
                               | product_id (FK)    |
                               | quantity           |
                               | added_at           |
                               | updated_at         |
                               +--------------------+
```

Order models:

```text
+--------------------+         +--------------------+
|       Order        |         |     OrderItem      |
+--------------------+         +--------------------+
| id (PK)            |         | id (PK)            |
| order_number       |-------->| order_id (FK)      |
| user_id (FK, opt)  |         | product_id (FK)    |
| full_name          |         | quantity           |
| email              |         | price              |
| phone_number       |         | item_total         |
| shipping_address1  |         +--------------------+
| shipping_address2  |
| shipping_city      |
| shipping_state     |
| shipping_zipcode   |
| shipping_country   |
| billing_name       |
| billing_address1   |
| billing_address2   |
| billing_city       |
| billing_state      |
| billing_zipcode    |
| billing_country    |
| created_at         |
| updated_at         |
| status             |
| payment_status     |
| shipping_cost      |
| total_price        |
| grand_total        |
| stripe_pid         |
| stripe_client_secret|
| payment_method_type|
| original_cart      |
| is_paid            |
| paid_at            |
| shipped_at         |
| delivered_at       |
| tracking_number    |
| notes              |
+--------------------+
```

### Key Relationships

#### Products Module

- `Category` ↔️ `Product`: One-to-Many (a category can have many products)
- `Product` ↔️ `Review`: One-to-Many (a product can have many reviews)
- `Product` ↔️ `InventoryLog`: One-to-Many (tracks stock changes over time)
- `Review` ↔️ `User`: Many-to-One (a user can leave many reviews)

#### Users Module

- `User` ↔️ `UserProfile`: One-to-One (each user has exactly one profile)
- `UserProfile` ↔️ `Address`: One-to-Many (a user can have multiple addresses)
- `UserProfile` ↔️ `Address` (default): One-to-One (a user profile has one
  default delivery address)
- `User` ↔️ `Address`: One-to-Many (a user can have multiple addresses)
- `User` ↔️ `ContactMessage`: One-to-Many (a user can submit multiple contact messages)
- `User` (staff) ↔️ `ContactMessage`: One-to-Many (a staff user can be assigned to multiple messages)

#### Shop Module

- `User` ↔️ `Cart`: One-to-One (a user has one cart)
- `User` ↔️ `ComparisonList`: One-to-One (a user has one comparison list)
- `User` ↔️ `RecentlyViewedItem`: One-to-Many (a user can have many recently
  viewed items)
- `Product` ↔️ `ComparisonList`: Many-to-Many (a product can be in many
  comparison lists)
- `Product` ↔️ `RecentlyViewedItem`: One-to-Many (a product can be recently
  viewed by many users)
- `Cart` ↔️ `CartItem`: One-to-Many (a cart contains multiple items)
- `CartItem` ↔️ `Product`: Many-to-One (many cart items can reference the same
  product)
- `User` ↔️ `Order`: One-to-Many (a user can have many orders)
- `Order` ↔️ `OrderItem`: One-to-Many (an order contains multiple items)
- `OrderItem` ↔️ `Product`: Many-to-One (many order items can reference the same
  product)
- `User` ↔️ `WishlistItem`: One-to-Many (a user can have many wishlist items)
- `WishlistItem` ↔️ `Product`: Many-to-One (many wishlist items can reference
  the same product)

#### Notable Features

- User profiles support customization with biographical information, preferences,
  and a profile image
- Multiple delivery addresses can be saved and managed per user
- Users can designate a default delivery address for faster checkout
- Theme preferences support light/dark mode UI customization
- Communication preferences help control how users receive notifications
- Marketing email opt-in/out is managed through user profiles
- Carts can be associated with either registered users or anonymous sessions
- Orders store product information at time of purchase to maintain historical
  records
- Inventory is managed through both product stock levels and a log of changes
- Products now support a `compare_at_price` field to enable sale pricing and
  discount display (original price vs. current price)
- Comparison lists allow users to compare up to 4 products side-by-side
- Recently viewed items are tracked to provide personalized recommendations
- Contact messages store user inquiries with metadata for efficient management
- Staff workflow for contact messages includes status tracking, assignment, and response handling

The database consists of relational tables that store information about users,
products, and orders. **Django's ORM** is used to interact with the database
efficiently.

[Back to top](#-contents)

---

### 🔹 Strategy for Schema Changes in Production

Managing **schema changes** in a production environment requires careful planning
to **minimize downtime** and **prevent data loss**. Below is the strategy we
follow:

#### **1️⃣ Plan & Assess the Change**

- Identify **which tables and fields** will be modified.
- Determine **dependencies & constraints** (e.g., foreign keys).
- Choose an **appropriate migration strategy** (Zero-Downtime, Rolling Migration,
  etc.).

#### **2️⃣ Use Django Migrations**

All schema changes are managed through Django's built-in migration framework:

```bash
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

```bash
pg_dump -U myuser -h mydbhost -d mydatabase -f backup.sql
```

- In case of failure, **restore the backup**:

```bash
psql -U myuser -h mydbhost -d mydatabase -f backup.sql
```

#### **5️⃣ Apply Migrations in Production**

Once the migration is tested and confirmed:

```bash
python manage.py migrate
```

- Use `--fake-initial` if migrations were manually applied before:

```bash
python manage.py migrate --fake-initial
```

#### **6️⃣ Monitor & Rollback if Needed**

- Monitor **database logs** and check for errors.
- If needed, **rollback the migration**:

```bash
python manage.py migrate myapp 000x_previous_migration
```

- Keep rollback **scripts ready** for critical changes.

[Back to top](#-contents)

---

## 📜 Database Change Log

All schema changes are documented in a structured manner for tracking purposes.

### 🔹 Template for Logging Database Changes

Each change is logged in `DATABASE_CHANGELOG.md` to keep track of modifications.

```markdown
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

[Back to top](#-contents)

---

## 📣 Marketing Strategy

### 🎯 Target Audience Analysis

The SkunkMonkey e-commerce platform targets the following customer segments:

1. **Tech-savvy consumers (25-45)** who value quality products with a streamlined
   shopping experience
2. **Bargain hunters** looking for competitive pricing and special offers
3. **Repeat customers** who appreciate loyalty rewards and personalized service
4. **Impulse buyers** attracted by featured products and limited-time offers

### 📱 Multi-Channel Marketing Approach

#### 1️⃣ SEO Strategy

- **Keyword Optimization**: Using carefully researched keywords in product
  descriptions, meta tags, and category pages
- **Technical SEO**: Implementing canonical URLs, proper site structure, and
  robots.txt configuration
- **Content Marketing**: Regular blog posts about product features, usage guides,
  and industry trends
- **Metadata Management**: Dynamic, keyword-rich meta descriptions and titles
  for all pages

#### 2️⃣ Social Media Marketing

- **Instagram**: Visual product showcases, lifestyle imagery, and user-generated
  content
- **Facebook**: Community building, customer service, and targeted ads
- **Twitter**: Brand announcements, promotions, and customer engagement
- **Pinterest**: Product pins organized by category with direct shopping links

#### 3️⃣ Email Marketing

- Welcome sequences for new subscribers
- Abandoned cart recovery emails
- Personalized product recommendations based on browsing/purchase history
- Regular newsletters with new arrivals and promotions
- Post-purchase follow-ups and reviews requests

#### 4️⃣ Customer Retention Strategy

- Loyalty program with points for purchases, reviews, and referrals
- VIP tiers with escalating benefits for repeat customers
- Exclusive early access to new products and sales
- Personalized shopping experience through saved preferences
- Streamlined checkout process with saved payment information

#### 5️⃣ Performance Metrics

- Conversion rate (by channel and campaign)
- Customer acquisition cost (CAC)
- Customer lifetime value (CLV)
- Average order value (AOV)
- Email open and click-through rates
- Social media engagement metrics
- Return on ad spend (ROAS)

### ⏱️ Implementation Timeline

1. **Month 1**: SEO optimization and technical implementation
2. **Month 2**: Email marketing automation setup
3. **Month 3**: Social media content calendar launch
4. **Month 4**: Loyalty program introduction
5. **Month 5-6**: Performance analysis and strategy refinement

[Back to top](#-contents)

---

## 🔍 Querying Migration History

To check applied migrations in PostgreSQL:

```sql
SELECT * FROM django_migrations ORDER BY applied DESC;
```

To check **last migration applied**:

```bash
python manage.py showmigrations myapp
```

[Back to top](#-contents)

---

## 🔄 Version Control & Documentation

- All migration files are **version-controlled** in Git.
- Commit messages follow this format:

```text
[DB] Added new payments table & updated user schema (#245)
```

- Release tags are used for **tracking major schema changes**:

```bash
git tag -a v1.5.0 -m "Database migration for payments table"
git push origin v1.5.0
```

[Back to top](#-contents)

---

## ✅ Best Practices for Database Changes

- Always **plan and test** schema changes in a **staging environment**.
- Use **Django migrations** instead of manual SQL changes.
- Follow **zero-downtime or rolling migrations** for production databases.
- Maintain a **backup before applying any changes**.
- Keep detailed **logs & rollback strategies** for each migration.

[Back to top](#-contents)

---

## 🎨 Design Choices

### 🖋 Typography

The site will use **Google Fonts**:

- **Primary Font:** Roboto (for readability)
- **Secondary Font:** Raleway (for headings)

### 🎨 Colors

The project will use a **modern, clean color scheme** with a focus on contrast
for readability.

```css
:root {
  --primary-color: #4CAF50;
  --secondary-color: #2E7D32;
  --text-color: #212121;
}
```

[Back to top](#-contents)

---

## 📌 Agile Project Management

This project is managed using **GitHub Projects** with a **KanBan board**,
structured as follows:

- **Backlog** – Features planned for future development.
- **To Do** – Tasks that are ready for development.
- **In Progress** – Features currently being worked on.
- **In Review** – Features pending approval/testing.
- **Done** – Completed and deployed features.

You can view the **KanBan board here**:
**[GitHub KanBan Board](https://github.com/users/Hedgemonkey/projects/3/)**

[Back to top](#-contents)

---

## 🔍 Features

### Current Features

#### 1. User Authentication System
- User registration with email verification
- Login/logout functionality
- Password reset capabilities
- Social authentication (Google, Facebook)
- User profile management

#### 2. Product Catalog
- Hierarchical product categories with image support
- Product listings with search, sort, and filter options
- Detailed product pages with comprehensive information
- Product attribute system for filtering by specifications
- Sale pricing with original price comparison

#### 3. Shopping Experience
- Shopping cart functionality (for both logged-in and anonymous users)
- Wishlist for saving products for later
- Product comparison tool (up to 4 products)
- Recently viewed products tracking
- Quick-view product modals

#### 4. Checkout Process
- Multi-step checkout with progress indicators
- Address management with default delivery address option
- Secure payment processing via Stripe
- Order confirmation emails
- Guest checkout option

#### 5. User Dashboard
- Order history and status tracking
- Saved addresses management
- Personal information management
- Communication preferences
- Theme preference selection (light/dark mode)

#### 6. Admin Features
- Comprehensive product management
- Order processing and fulfillment
- Customer management
- Sales and inventory reports
- Contact message management workflow

#### 7. Marketing Tools
- SEO-optimized product pages
- Product ratings and reviews
- Related products recommendations
- Newsletter subscription
- Promotional banner system

### Planned Features

#### 1. Enhanced Product Discovery
- AI-powered product recommendations
- Advanced filtering by multiple attributes
- "Shop the look" functionality
- Virtual try-on technology

#### 2. Improved Customer Experience
- Live chat support
- Loyalty points program
- Subscription services
- Back-in-stock notifications

#### 3. Advanced Analytics
- Enhanced sales dashboards
- Customer behavior analysis
- Marketing campaign performance metrics
- A/B testing framework

[Back to top](#-contents)

---

## 🧪 Testing

### Manual Testing

The application has been thoroughly tested manually across different browsers, devices, and screen sizes to ensure functionality and responsiveness. The testing process included:

- User registration, login, and account management
- Product browsing, filtering, and search functionality
- Shopping cart operations and checkout process
- Order placement and payment processing
- Admin panel operations and content management
- Form validations and error handling

### Automated Testing

A suite of automated tests has been implemented using Django's testing framework:

#### Unit Tests
- Testing individual models, views, and forms
- Validating business logic and calculations
- Testing database operations and constraints

#### Integration Tests
- Testing the flow between components
- Validating user journeys and workflows
- Testing third-party integrations (Stripe, AWS S3)

#### Performance Testing
- Testing application response times
- Database query optimization
- Static asset loading performance

### Browser and Device Testing

The application has been tested on the following browsers:
- Chrome (versions 90+)
- Firefox (versions 85+)
- Safari (versions 14+)
- Edge (versions 90+)
- Mobile browsers (iOS Safari, Chrome for Android)

The application has been tested on the following devices:
- Desktop (various screen resolutions)
- Tablets (iPad, Samsung Galaxy Tab)
- Mobile phones (iPhone 12/13/14, Samsung Galaxy S21/S22)

### Test Documentation

Detailed test cases, test results, and identified issues are documented in the project's testing documentation.

[Back to top](#-contents)

---

## 🏆 Credits

### Code Resources

- **[Django Documentation](https://docs.djangoproject.com/)** - Framework guidance and best practices
- **[Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)** - Responsive layout and components
- **[Vite Documentation](https://vitejs.dev/guide/)** - Frontend build configuration and optimization
- **[Stripe Documentation](https://stripe.com/docs)** - Payment integration and webhook handling
- **[AWS S3 Documentation](https://docs.aws.amazon.com/s3/)** - Media storage and CDN configuration
- **[PostgreSQL Documentation](https://www.postgresql.org/docs/)** - Database design and optimization

### Backend Technologies

#### **Core Framework & Language**
- **[Django 5.1.6](https://www.djangoproject.com/)** - High-level Python web framework
- **[Python 3.13.3](https://www.python.org/)** - Programming language
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database system
- **[Gunicorn 23.0.0](https://gunicorn.org/)** - WSGI HTTP server for production

#### **Django Extensions & Packages**
- **[django-allauth 65.4.1](https://django-allauth.readthedocs.io/)** - Authentication system with social login
- **[django-countries 7.6.1](https://pypi.org/project/django-countries/)** - Country field and data
- **[django-crispy-forms 2.3](https://django-crispy-forms.readthedocs.io/)** - Enhanced form styling and layout
- **[django-storages 1.14.6](https://django-storages.readthedocs.io/)** - AWS S3 integration for media files
- **[django-vite 3.1.0](https://pypi.org/project/django-vite/)** - Vite integration for Django
- **[dj-stripe 2.9.0](https://dj-stripe.readthedocs.io/)** - Stripe payment processing integration
- **[WhiteNoise 6.9.0](http://whitenoise.evans.io/)** - Static file serving for production

#### **Supporting Libraries**
- **[Pillow 11.1.0](https://pillow.readthedocs.io/)** - Image processing and manipulation
- **[boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)** - AWS SDK for Python
- **[psycopg2-binary](https://pypi.org/project/psycopg2-binary/)** - PostgreSQL adapter for Python
- **[python-decouple](https://pypi.org/project/python-decouple/)** - Environment variable management

### Frontend Technologies

#### **Build System & Package Management**
- **[Vite 6.3.0](https://vitejs.dev/)** - Frontend build tool and development server
- **[npm](https://www.npmjs.com/)** - Package manager for JavaScript
- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment

#### **CSS Framework & Styling**
- **[Bootstrap 5.3](https://getbootstrap.com/)** - Responsive CSS framework
- **[FontAwesome](https://fontawesome.com/)** - Icon library and toolkit
- **[Google Fonts](https://fonts.google.com/)** - Web font service (Roboto, Raleway)

#### **JavaScript Libraries**
- **[Chart.js](https://www.chartjs.org/)** - Interactive charts for admin analytics
- **[jQuery](https://jquery.com/)** - JavaScript library for DOM manipulation
- **[Select2](https://select2.org/)** - Enhanced select boxes and multi-select
- **[SweetAlert2](https://sweetalert2.github.io/)** - Beautiful, responsive popups and notifications
- **[Stripe.js 11.6.0](https://stripe.com/docs/js)** - Client-side payment processing

### Infrastructure & Deployment

#### **Hosting & Platform**
- **[Heroku](https://www.heroku.com/)** - Cloud platform for deployment
- **[AWS S3](https://aws.amazon.com/s3/)** - Object storage for media files
- **[CloudFront](https://aws.amazon.com/cloudfront/)** - Content delivery network (CDN)

#### **Development & Version Control**
- **[Git](https://git-scm.com/)** - Version control system
- **[GitHub](https://github.com/)** - Repository hosting and project management
- **[VS Code](https://code.visualstudio.com/)** - Integrated development environment
- **[GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects)** - Agile project management and KanBan boards

### Testing & Quality Assurance

#### **Testing Frameworks**
- **[Django TestCase](https://docs.djangoproject.com/en/5.1/topics/testing/)** - Built-in unit and integration testing
- **[Coverage.py](https://coverage.readthedocs.io/)** - Code coverage measurement
- **[Selenium](https://selenium-python.readthedocs.io/)** - Browser automation for end-to-end testing

#### **Code Quality Tools**
- **[Flake8](https://flake8.pycqa.org/)** - Python code linting and style checking
- **[Black](https://black.readthedocs.io/)** - Python code formatter
- **[isort](https://pycqa.github.io/isort/)** - Python import statement organizer

### Design & User Experience

#### **Design Tools**
- **[Figma](https://www.figma.com/)** - UI/UX design and wireframing
- **[Placeholder.com](https://placeholder.com/)** - Placeholder images for development

#### **Accessibility & SEO**
- **[WAVE Web Accessibility Evaluator](https://wave.webaim.org/)** - Accessibility testing
- **[Google Lighthouse](https://developers.google.com/web/tools/lighthouse)** - Performance and SEO auditing

### Media Resources

#### **Stock Photography**
- **[Unsplash](https://unsplash.com/)** - High-quality stock photos (Free license)
- **[Pexels](https://www.pexels.com/)** - Free stock photos and videos
- **[Pixabay](https://pixabay.com/)** - Free images, vectors, and illustrations

#### **Icons & Graphics**
- **[FontAwesome Free](https://fontawesome.com/plans)** - Icon library (Free license)
- **[Heroicons](https://heroicons.com/)** - Beautiful hand-crafted SVG icons
- **[unDraw](https://undraw.co/)** - Open-source illustrations (Free license)

### Educational Resources

#### **Learning Platforms**
- **[Code Institute](https://codeinstitute.net/)** - Full-stack development course and mentorship
- **[Real Python](https://realpython.com/)** - Python tutorials and best practices
- **[MDN Web Docs](https://developer.mozilla.org/)** - Web development documentation

#### **Community & Support**
- **[Django Community](https://www.djangoproject.com/community/)** - Official Django community forums
- **[Stack Overflow](https://stackoverflow.com/)** - Developer Q&A platform

### Special Thanks

#### **Development Mentorship**
- **Code Institute Tutors and Mentors** - Guidance, feedback, and technical support throughout development
- **Cohort Facilitators** - Project management guidance and career development advice
- **Fellow Students** - Peer code reviews, testing assistance, and collaborative learning

#### **Testing & Feedback**
- **Beta Testers** - Community members who provided valuable feedback during development
- **Accessibility Testers** - Users who helped ensure the platform is accessible to all users
- **Performance Testers** - Contributors who helped optimize loading times and user experience

#### **Open Source Community**
- **Django Software Foundation** - For maintaining the Django framework
- **Python Software Foundation** - For Python language development and support
- **All Open Source Contributors** - Developers who contribute to the libraries and tools used in this project

### Legal & Compliance

#### **Security Standards**
- **OWASP Top 10** - Web application security guidelines
- **GDPR Compliance Guidelines** - Data protection and privacy requirements
- **PCI DSS Standards** - Payment card industry security standards

#### **Licensing Information**
- All third-party libraries used in accordance with their respective licenses
- Product images used with appropriate permissions or under free licenses
- Code examples adapted from documentation with proper attribution

---

### 🛡️ Disclaimer

This project is developed for **educational purposes** as part of the Code Institute Full Stack Development program. All product listings, pricing, and company information are **fictional and for demonstration purposes only**. The payment system uses Stripe's test mode, and no real transactions are processed.

The SkunkMonkey brand, logo, and associated imagery are created specifically for this educational project and are not affiliated with any existing commercial entity.

For any questions about licensing, attribution, or usage of this educational project, please contact the development team through the GitHub repository.

[Back to top](#-contents)

---

## ✅ Validations

### Code Quality Validation

The SkunkMonkey project maintains high code quality standards through comprehensive validation processes:

#### **Python Code Validation**
- **PEP 8 Compliance**: All Python code follows PEP 8 style guidelines
- **Flake8 Linting**: Automated checking for code style and potential errors
- **Django Best Practices**: Adherence to Django framework conventions
- **Type Hints**: Implementation of Python type hints for better code documentation

#### **HTML Validation**
- **W3C Markup Validator**: All HTML templates validated for proper structure
- **Semantic HTML**: Use of appropriate HTML5 semantic elements
- **Accessibility Standards**: WCAG 2.1 compliance for screen readers and assistive technologies

#### **CSS Validation**
- **W3C CSS Validator**: Custom CSS validated for syntax errors
- **Bootstrap Integration**: Proper use of Bootstrap classes and components
- **Responsive Design**: CSS tested across multiple device breakpoints

#### **JavaScript Validation**
- **ESLint**: JavaScript code linting for consistency and error detection
- **Modern ES6+ Standards**: Use of current JavaScript best practices
- **Cross-browser Compatibility**: Testing across major browsers

### Security Validation

#### **Django Security Framework**
- **CSRF Protection**: Cross-Site Request Forgery protection enabled
- **SQL Injection Prevention**: Django ORM prevents SQL injection attacks
- **XSS Protection**: Cross-Site Scripting protection through template escaping
- **Secure Headers**: Implementation of security headers (HSTS, X-Frame-Options)

#### **Authentication Security**
- **Password Validation**: Strong password requirements enforced
- **Session Security**: Secure session handling and timeout
- **Email Verification**: Account verification through email confirmation
- **Social Authentication**: Secure OAuth integration with Google and Facebook

#### **Payment Security**
- **PCI DSS Compliance**: Stripe integration ensures payment card security
- **HTTPS Enforcement**: All payment processes over encrypted connections
- **Webhook Verification**: Stripe webhook signature validation

### Performance Validation

#### **Google Lighthouse Scores**
- **Performance**: 90+ score for optimized loading times
- **Accessibility**: 95+ score for inclusive design
- **Best Practices**: 90+ score for web development standards
- **SEO**: 95+ score for search engine optimization

#### **Database Performance**
- **Query Optimization**: Efficient database queries with minimal N+1 problems
- **Index Usage**: Proper database indexing for faster lookups
- **Connection Pooling**: Optimized database connection management

#### **Frontend Performance**
- **Asset Optimization**: Minified CSS and JavaScript files
- **Image Optimization**: Compressed images with appropriate formats
- **CDN Integration**: Static assets served through AWS CloudFront

### User Experience Validation

#### **Responsive Design Testing**
- **Mobile-First Approach**: Design validated on mobile devices first
- **Cross-Device Testing**: Consistent experience across tablets, phones, and desktops
- **Touch Interface**: Mobile-friendly touch targets and gestures

#### **Browser Compatibility**
- **Chrome**: Versions 90+ (Full support)
- **Firefox**: Versions 85+ (Full support)
- **Safari**: Versions 14+ (Full support)
- **Edge**: Versions 90+ (Full support)
- **Mobile Browsers**: iOS Safari and Chrome for Android

#### **Form Validation**
- **Client-Side Validation**: Immediate feedback for user input
- **Server-Side Validation**: Backend validation for data integrity
- **Error Messaging**: Clear, actionable error messages
- **Success Feedback**: Confirmation messages for completed actions

### Accessibility Validation

#### **WCAG 2.1 Compliance**
- **Level AA Compliance**: Meeting Web Content Accessibility Guidelines
- **Screen Reader Testing**: Compatibility with NVDA, JAWS, and VoiceOver
- **Keyboard Navigation**: Full site navigation without mouse
- **Color Contrast**: Minimum 4.5:1 contrast ratio for text

#### **Semantic Markup**
- **Proper Heading Structure**: Logical H1-H6 hierarchy
- **ARIA Labels**: Descriptive labels for interactive elements
- **Alt Text**: Meaningful alternative text for all images
- **Focus Management**: Clear focus indicators for keyboard users

### Testing Validation

#### **Test Coverage**
- **Unit Tests**: 85%+ code coverage for critical functions
- **Integration Tests**: End-to-end user journey testing
- **Performance Tests**: Load testing for concurrent users
- **Security Tests**: Penetration testing for vulnerabilities

#### **Manual Testing**
- **User Acceptance Testing**: Real user feedback and validation
- **Cross-Platform Testing**: Testing on various operating systems
- **Edge Case Testing**: Validation of unusual but possible scenarios
- **Regression Testing**: Ensuring new features don't break existing functionality

[Back to top](#-contents)

---

## 🚀 Deployment

This project can be deployed locally for development or to production servers. Below are the instructions for deployment.

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hedgemonkey/skunkmonkey.git
   cd skunkmonkey
   ```

2. **Set up a virtual environment**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory and add the required variables:
   ```
   SECRET_KEY=your_secret_key
   DEBUG=True
   DATABASE_URL=your_database_url
   STRIPE_PUBLIC_KEY=your_stripe_public_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Build frontend assets**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

7. **Run the development server**
   ```bash
   python manage.py runserver
   ```

### Heroku Deployment

Heroku is a platform as a service (PaaS) that enables developers to build, run, and operate applications entirely in the cloud. Follow these steps to deploy the Django application on Heroku:

#### 1. Prerequisites

1. **Create a Heroku account**
   - Sign up at [heroku.com](https://heroku.com) if you don't already have an account

2. **Install the Heroku CLI**
   ```bash
   # For Ubuntu/Debian
   sudo snap install heroku --classic

   # For macOS
   brew tap heroku/brew && brew install heroku

   # For other systems, see: https://devcenter.heroku.com/articles/heroku-cli
   ```

3. **Login to Heroku**
   ```bash
   heroku login
   ```

#### 2. Prepare Your Application for Heroku

1. **Create a Procfile**
   Create a file named `Procfile` (no extension) in the project root:
   ```
   web: gunicorn skunkmonkey.wsgi:application
   release: python manage.py migrate
   ```

2. **Install required packages**
   ```bash
   pip install gunicorn dj-database-url psycopg2-binary whitenoise
   pip freeze > requirements.txt
   ```

3. **Update settings.py for Heroku**
   Ensure these settings are in your `skunkmonkey/settings.py`:
   ```python
   import os
   import dj_database_url

   # Get the DATABASE_URL environment variable or use SQLite as a fallback
   DATABASES = {
       'default': dj_database_url.config(default=os.environ.get('DATABASE_URL', 'sqlite:///db.sqlite3'))
   }

   # Add whitenoise for static files
   MIDDLEWARE = [
       # ...existing middleware...
       'whitenoise.middleware.WhiteNoiseMiddleware',
       # ...other middleware...
   ]

   # Static files settings
   STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
   STATIC_URL = '/static/'
   STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

   # Allow Heroku domain
   ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.herokuapp.com']
   ```

4. **Add a runtime.txt file**
   ```
   python-3.11.7
   ```

5. **Build frontend assets**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

6. **Collect static files**
   ```bash
   python manage.py collectstatic --noinput
   ```

#### 3. Create and Deploy to Heroku

1. **Create a new Heroku application**
   ```bash
   heroku create skunkmonkey-app
   ```

2. **Add PostgreSQL add-on**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Configure environment variables**
   ```bash
   heroku config:set SECRET_KEY=your_secret_key
   heroku config:set DEBUG=False
   heroku config:set STRIPE_PUBLIC_KEY=your_stripe_public_key
   heroku config:set STRIPE_SECRET_KEY=your_stripe_secret_key
   heroku config:set STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. **Deploy to Heroku**
   ```bash
   # Add all files to git
   git add .
   git commit -m "Prepare for Heroku deployment"

   # Deploy to Heroku
   git push heroku main
   ```

5. **Create a superuser on Heroku**
   ```bash
   heroku run python manage.py createsuperuser
   ```

#### 4. Configure AWS S3 for Media Files (Optional)

1. **Create an AWS S3 bucket**
   - Sign up for AWS if you haven't already
   - Create a new S3 bucket for your media files
   - Configure bucket permissions for public read access

2. **Install required packages**
   ```bash
   pip install boto3 django-storages
   pip freeze > requirements.txt
   ```

3. **Update settings.py**
   ```python
   # AWS S3 configuration
   if 'USE_AWS' in os.environ:
       # Add django-storages to INSTALLED_APPS
       INSTALLED_APPS += ['storages']

       # AWS settings
       AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
       AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME')
       AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
       AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')

       # S3 URLs
       AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'

       # Media files configuration
       DEFAULT_FILE_STORAGE = 'custom_storages.MediaStorage'
       MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
       MEDIA_ROOT = 'media/'
   ```

4. **Create custom_storages.py**
   ```python
   from django.conf import settings
   from storages.backends.s3boto3 import S3Boto3Storage

   class MediaStorage(S3Boto3Storage):
       location = settings.MEDIA_ROOT
   ```

5. **Set AWS environment variables in Heroku**
   ```bash
   heroku config:set USE_AWS=True
   heroku config:set AWS_STORAGE_BUCKET_NAME=your-bucket-name
   heroku config:set AWS_S3_REGION_NAME=your-region
   heroku config:set AWS_ACCESS_KEY_ID=your-key-id
   heroku config:set AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

6. **Deploy again with AWS configuration**
   ```bash
   git add .
   git commit -m "Add AWS S3 configuration"
   git push heroku main
   ```

#### 5. Ongoing Maintenance

1. **Update your application**
   Whenever you make changes to your project:
   ```bash
   # Build frontend assets if needed
   cd frontend && npm run build && cd ..

   # Commit changes
   git add .
   git commit -m "Your update message"

   # Deploy to Heroku
   git push heroku main
   ```

2. **Monitor your application**
   ```bash
   # View logs
   heroku logs --tail

   # Access the Heroku dashboard
   heroku open
   ```

3. **Database operations**
   ```bash
   # Run migrations
   heroku run python manage.py migrate

   # Access the Django shell
   heroku run python manage.py shell
   ```

By following these steps, you'll have the SkunkMonkey e-commerce platform properly deployed on Heroku with all necessary configurations for a production environment.

[Back to top](#-contents)
