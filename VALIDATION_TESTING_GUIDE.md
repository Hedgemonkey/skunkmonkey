# 🔍 Complete Validation Testing Guide for SkunkMonkey

This guide provides step-by-step instructions to perform all validation checks mentioned in the README.md file.

---

## 📋 Prerequisites

Before starting, ensure you have:
- Your project running locally (`python manage.py runserver`)
- Access to your live Heroku deployment
- Modern browsers installed (Chrome, Firefox, Safari, Edge)
- Developer tools knowledge for browser testing

---

## 🐍 1. Python Code Validation

### 1.1 PEP 8 Compliance with Flake8

```bash
# Navigate to your project root
cd /home/hedgemonkey/Documents/Work/code_institute/API_boilerplate/skunkmonkey

# Run Flake8 with your existing configuration
flake8 --config=setup.cfg

# For detailed output with line numbers
flake8 --config=setup.cfg --show-source --statistics
```

**Expected Result:** Zero errors
**Screenshot Needed:** ✅ Terminal output showing "0 errors found" or no output

### 1.2 Check Django Best Practices

```bash
# Check for Django-specific issues
python manage.py check
python manage.py check --deploy
```

**Expected Result:** No issues found
**Screenshot Needed:** ✅ Terminal output showing system checks

---

## 🌐 2. HTML Validation

### 2.1 W3C Markup Validator

**Manual Steps:**
1. Go to https://validator.w3.org/
2. Enter your live site URL: `https://skunkmonkey-225daa98122d.herokuapp.com/`
3. Test key pages:
   - Homepage: `/`
   - Shop page: `/shop/`
   - Product detail: `/shop/products/[any-product-slug]/`
   - Cart: `/shop/cart/`
   - Checkout: `/shop/checkout/` (requires items in cart)

**Screenshot Needed:** ✅ Validation results for each page showing "Document checking completed. No errors or warnings to show."

### 2.2 Validate Local Templates (Alternative Method)

```bash
# Install html5validator if not already installed
pip install html5validator

# Validate rendered HTML (requires running server)
# Save HTML source from browser and validate
html5validator --root templates/ --also-check-css
```

---

## 🎨 3. CSS Validation

### 3.1 W3C CSS Validator

**Manual Steps:**
1. Go to https://jigsaw.w3.org/css-validator/
2. Enter your live site URL: `https://skunkmonkey-225daa98122d.herokuapp.com/`
3. Or validate specific CSS files:
   - Main CSS: Check your static CSS files via URL

**Screenshot Needed:** ✅ CSS validation results showing "Congratulations! No Error Found."

### 3.2 Validate Local CSS Files

```bash
# Navigate to frontend directory
cd frontend

# Check CSS syntax with stylelint (already installed locally)
npx stylelint "src/**/*.css"

# To automatically fix fixable issues
npx stylelint "src/**/*.css" --fix
```

---

## 💻 4. JavaScript Validation

### 4.1 ESLint Validation

```bash
# Navigate to frontend directory
cd frontend

# Install ESLint if not already installed
npm install -g eslint

# Initialize ESLint config (if not exists)
npx eslint --init

# Run ESLint on your JavaScript files
npx eslint src/**/*.js

# Fix auto-fixable issues
npx eslint src/**/*.js --fix
```

**Screenshot Needed:** ✅ Terminal output showing linting results

### 4.2 Browser Console Check

**Manual Steps:**
1. Open your live site in Chrome
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Navigate through all major pages and check for JavaScript errors
5. Test interactive features (cart, wishlist, forms)

**Screenshot Needed:** ✅ Console showing no errors on key pages

---

## 🔒 5. Security Validation

### 5.1 Django Security Check

```bash
# Run Django security checks
python manage.py check --deploy

# Check for common security issues
python manage.py check --tag security
```

### 5.2 SSL/HTTPS Verification

**Manual Steps:**
1. Visit your live site: `https://skunkmonkey-225daa98122d.herokuapp.com/`
2. Check for green padlock in browser
3. Verify certificate details

**Screenshot Needed:** ✅ Browser address bar showing secure connection

### 5.3 Security Headers Check

**Online Tool:**
1. Go to https://securityheaders.com/
2. Enter your site URL: `https://skunkmonkey-225daa98122d.herokuapp.com/`
3. Check the security grade

**Screenshot Needed:** ✅ Security headers report

---

## ⚡ 6. Performance Validation

### 6.1 Google Lighthouse Audit

**Manual Steps:**
1. Open Chrome and navigate to your live site
2. Press F12 → Lighthouse tab
3. Select all categories (Performance, Accessibility, Best Practices, SEO)
4. Run audit on key pages:
   - Homepage
   - Shop page
   - Product detail page
   - Checkout page

**Screenshot Needed:** ✅ Lighthouse scores for each page (aim for 90+ in each category)

### 6.2 GTmetrix Performance Test

**Manual Steps:**
1. Go to https://gtmetrix.com/
2. Enter your site URL
3. Run the test

**Screenshot Needed:** ✅ GTmetrix performance report

### 6.3 Database Query Analysis

```bash
# Check for N+1 queries and slow queries
# Add this to your settings for local testing
# LOGGING = {
#     'loggers': {
#         'django.db.backends': {
#             'level': 'DEBUG',
#         }
#     }
# }

# Run a test request and check query count
python manage.py shell
>>> from django.test import Client
>>> from django.db import connection
>>> client = Client()
>>> connection.queries_log.clear()
>>> response = client.get('/shop/')
>>> print(f"Query count: {len(connection.queries)}")
```

---

## ♿ 7. Accessibility Validation

### 7.1 WAVE Web Accessibility Evaluator

**Manual Steps:**
1. Go to https://wave.webaim.org/
2. Enter your site URL: `https://skunkmonkey-225daa98122d.herokuapp.com/`
3. Review the accessibility report
4. Test key pages

**Screenshot Needed:** ✅ WAVE report showing minimal or no errors

### 7.2 Lighthouse Accessibility Audit

(Covered in Performance section above - check accessibility score)

!!!--- Didn't test ---!!! ### 7.3 Manual Keyboard Navigation Test

**Manual Steps:**
1. Navigate your site using only Tab, Enter, and arrow keys
2. Ensure all interactive elements are reachable
3. Check focus indicators are visible

**Screenshot Needed:** ✅ Screenshots showing visible focus indicators

!!!--- Didn't test ---!!! ### 7.4 Screen Reader Testing (Optional but Recommended)

**Manual Steps:**
1. Install NVDA (Windows) or use VoiceOver (Mac)
2. Navigate your site with screen reader enabled
3. Check that content is properly announced

---

## 📱 8. Responsive Design Validation

### 8.1 Browser Developer Tools Testing

**Manual Steps:**
1. Open Chrome Developer Tools (F12)
2. Click device toolbar icon (mobile view)
3. Test these viewport sizes:
   - Mobile: 320px, 375px, 414px
   - Tablet: 768px, 1024px
   - Desktop: 1200px, 1920px

**Screenshot Needed:** ✅ Screenshots of key pages at different viewport sizes

### 8.2 Real Device Testing

**Manual Steps:**
1. Test on actual mobile devices if available
2. Test on different browsers:
   - iOS Safari
   - Android Chrome
   - Samsung Internet

**Screenshot Needed:** ✅ Photos of site running on real devices

---

## 🌐 9. Cross-Browser Compatibility

### 9.1 Browser Testing Matrix

Test your site on:
- **Chrome** (latest version)
- **Firefox** (latest version)
- **Safari** (if on Mac)
- **Edge** (latest version)

**Manual Steps:**
1. Open each browser
2. Navigate to key pages
3. Test interactive features
4. Check for layout differences

**Screenshot Needed:** ✅ Screenshots from each browser showing consistent layout

---

## 🧪 10. Functional Testing Validation

### 10.1 User Journey Testing

**Test Scenarios:**
1. **Guest User Purchase:**
   - Browse products → Add to cart → Checkout as guest → Complete payment

2. **Registered User Journey:**
   - Register → Login → Browse → Add to wishlist → Purchase

3. **Admin Functionality:**
   - Login to admin → Add/edit products → Process orders

**Screenshot Needed:** ✅ Screenshots of successful completion of each journey

### 10.2 Form Validation Testing

**Manual Steps:**
1. Test all forms with invalid data
2. Check error messages appear
3. Test with valid data
4. Verify success messages

**Forms to Test:**
- Registration form
- Login form
- Contact form
- Checkout form
- Product review form

---

## 💳 11. Payment System Validation

### 11.1 Stripe Test Payments

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

**Manual Steps:**
1. Add items to cart
2. Proceed to checkout
3. Use test card numbers
4. Verify payment processing

**Screenshot Needed:** ✅ Successful payment confirmation page

### 11.2 Webhook Testing

```bash
# Check webhook endpoint
curl -X POST https://skunkmonkey-225daa98122d.herokuapp.com/shop/stripe-webhook/ \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

---

## 📊 12. Creating Validation Report

### 12.1 Document Results

Create a validation report with:
1. All screenshots organized by category
2. Pass/fail status for each test
3. Any issues found and how they were resolved
4. Performance metrics and scores

### 12.2 Suggested Report Structure

```
validation_results/
├── 1_code_quality/
│   ├── flake8_results.png
│   ├── django_check.png
├── 2_html_validation/
│   ├── homepage_html_valid.png
│   ├── shop_page_html_valid.png
├── 3_css_validation/
│   ├── css_validation_results.png
├── 4_javascript/
│   ├── eslint_results.png
│   ├── console_errors_check.png
├── 5_security/
│   ├── security_headers.png
│   ├── ssl_certificate.png
├── 6_performance/
│   ├── lighthouse_homepage.png
│   ├── lighthouse_shop.png
│   ├── gtmetrix_results.png
├── 7_accessibility/
│   ├── wave_report.png
│   ├── keyboard_navigation.png
├── 8_responsive/
│   ├── mobile_320px.png
│   ├── tablet_768px.png
│   ├── desktop_1200px.png
├── 9_browsers/
│   ├── chrome_screenshot.png
│   ├── firefox_screenshot.png
│   ├── safari_screenshot.png
└── 10_functional/
    ├── user_registration.png
    ├── payment_success.png
    └── admin_functions.png
```

---

## 🚀 Quick Start Checklist

For immediate validation testing:

```bash
# 1. Code Quality
flake8 --config=setup.cfg
python manage.py check --deploy

# 2. Frontend Build
cd frontend && npm run build

# 3. Run local server
python manage.py runserver

# 4. Open browser and test core functionality
# 5. Use online validators for HTML/CSS
# 6. Run Lighthouse audit
# 7. Test on mobile device
```

**Time Estimate:** 2-4 hours for comprehensive validation testing

---

## 📝 Notes

- Some validations require your site to be running (locally or live)
- Screenshots are essential for documentation and portfolio purposes
- Keep validation results for future reference
- Re-run validations after any significant code changes
- Consider automating some of these checks in your CI/CD pipeline

---

**Remember:** The goal is not just to pass validation, but to ensure your site provides an excellent user experience across all devices and browsers!
