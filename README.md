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
    - [Database Schema](#database-schema)
    - [Wireframes](#wireframes)
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

### 📄 Overview  

The SkunkMonkey site will be structured around the following pages:

- **Home Page** – Displays featured products, promotions, and categories.
- **Product Listings** – Browse products with search and filtering options.
- **Product Details** – View individual product information.
- **Shopping Cart** – Manage selected items before purchase.
- **Checkout** – Secure payment processing and order confirmation.
- **User Dashboard** – Manage orders, profile, and preferences.
- **Admin Panel** – Control products, users, and orders.

### 🗄 Database Schema

Below is a **simplified schema** for the project. The database will be built using **PostgreSQL**, optimized for performance and scalability.

```
+------------------+       +------------------+       +------------------+
| User             |       | Product          |       | Order            |
+------------------+       +------------------+       +------------------+
| id (PK)          |<----->| id (PK)          |<----->| id (PK)          |
| username         |       | name             |       | user_id (FK)     |
| email            |       | description      |       | total_price      |
| password         |       | price            |       | status           |
+------------------+       | stock_quantity   |       | created_at       |
                           | category_id (FK) |       +------------------+
                           +------------------+
```

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
2. **CI/CD Pipeline**:
   - GitHub Actions will be set up for automated testing and deployment.
3. **Environment Variables**:
   - Sensitive settings (e.g., `SECRET_KEY`, database credentials) will be stored in the **Heroku Config Vars** or an `.env` file in the server.
4. **PostgreSQL Database**:
   - A managed **PostgreSQL database** will be used for scalability.
5. **Static & Media Files**:
   - **AWS S3** or **Cloudinary** will be used for storing static and media assets.
6. **Security & Performance**:
   - SSL Certificates (HTTPS)
   - Gunicorn as WSGI server
   - Cloudflare CDN (optional)

[Back to top](#contents)

---

## 📜 Credits

### **Resources & Libraries**
- **[Bootstrap Full Width Pics](https://startbootstrap.com/theme/full-width-pics)** – Free Bootstrap template used as the base theme.
- **Django** – Python-based web framework.
- **PostgreSQL** – Database system for backend data storage.
- **Bootstrap 5** – Frontend styling framework.
- **FontAwesome** – Icons used throughout the project.

### **Tools & Services**
- **GitHub Projects** – Used for Agile task management with KanBan.
- **GitHub Copilot** & **ChatGPT** – Assisted with code and documentation.
- **Code Institute** – Provided guidance and feedback.

### **Acknowledgments**
Special thanks to:
- The **Code Institute community** for advice and support.
- **Friends and family** for testing and feedback.
- Open-source contributors for maintaining the libraries used in this project.

[Back to top](#contents)