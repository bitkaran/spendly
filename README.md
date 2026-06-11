# Spendly

<p align="center">
  <strong>Track every rupee. Spend smarter.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20v19-61dafb?style=for-the-badge&logo=react" alt="React Badge" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20v4-38bdf8?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS Badge" />
  <img src="https://img.shields.io/badge/Backend-Node%20%2B%20Express-339933?style=for-the-badge&logo=node.js" alt="Node.js Badge" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47a248?style=for-the-badge&logo=mongodb" alt="MongoDB Badge" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License Badge" />
</p>

---

## Project Overview

**Spendly** is a premium, mobile-first advanced expense tracking web application. Unlike typical finance websites, Spendly is designed to feel and act like a real mobile app installed from the App Store/Play Store, but running inside the web browser. 

It is designed for rapid logging of daily expenses (meals, auto/metro rides, custom tags), provides automated narrative summaries (bank-statement style descriptions), offers dynamic date/category mathematical calculations, generates visual trend graphs using Recharts, and outputs fully styled Excel spreadsheet ledgers using `exceljs`.

---

## Core Features

1. **User Authentication & Verification**:
   - Secure account registration with email OTP verification before activation.
   - JWT-based login sessions with visual password toggles.
   - Forgotten password recovery through OTP verification.
   - Strict session routes protection (each user can *only* access their own transactions).
   - In production, OTP codes are never returned in API payloads.

2. **App-like Dashboard**:
   - Quick counters showing Today's total spending and Month's total spending.
   - Dynamic progress meters showing top category spend.
   - Horizontal sliding category filters to isolate recent transactions instantly.
   - Quick add expense dialog showing segmented payment option pickers.

3. **Daily Expense Ledger**:
   - Log expenses with exact date, category, positive amounts, optional remarks, and payment modes (*Cash, UPI, Card, Other*).
   - Dynamic ledger tables displaying all transaction entries.
   - Swipe-like quick edit and delete triggers with confirmation modal popups.
   - Seeds 8 default categories automatically upon validation (*Coming Auto, Coming Metro, Return Auto, Return Metro, Lunch, Dinner, Snacks / Tea, Other*) and allows users to create custom categories.

4. **Statement narrative**:
   - Generates text summaries: *"On 11 Jun 2026, ₹150.00 was spent in Lunch. Remark: 'With office team'."*
   - Advanced filters: Category tags, dates, payment modes, min/max limits, and search bars for remarks.

5. **Custom Calculator**:
   - Isolates specific categories between dates and computes total spending, entry density, daily average values, highest peak transactions, and lowest trough transactions.

6. **Excel Spreadsheet Export**:
   - Exports the currently filtered statement or full history directly to formatted Excel sheets (`expense-statement-YYYY-MM.xlsx`) containing styled header grids, currency masks, borders, and built-in auto-filters.

7. **Preferences & Backups**:
   - Dark/Light display mode toggles.
   - Data exports: Download a complete JSON document backup of your categories and transactions in one click.

---

## Folder Structure

```
spendly/
├── client/                 # Frontend React + Vite SPA
│   ├── public/             # Static public resources
│   ├── src/
│   │   ├── components/     # Layout overlays (Topbar, Bottom Nav, Sheets, Modals)
│   │   ├── pages/          # Screens (Dashboard, Statement, Analytics, Calculator, Profile, Auth)
│   │   ├── utils/          # Axios configuration with JWT Interceptors
│   │   ├── index.css       # Tailwind v4 globals & custom animations
│   │   ├── App.jsx         # App router and central state container
│   │   └── main.jsx        # App entry point
│   ├── package.json        # Frontend scripts and package details
│   ├── postcss.config.js   # Dev configuration
│   └── vite.config.js      # Vite config utilizing @tailwindcss/vite
├── server/                 # Backend Node + Express API
│   ├── config/             # Database connection setups
│   ├── controllers/        # Route controllers (Auth, Expenses, Categories, Analytics, Export)
│   ├── middleware/         # Session verification protect middleware
│   ├── models/             # Mongoose database models (User, Expense, Category)
│   ├── routes/             # REST endpoints route declarations
│   ├── utils/              # Nodemailer templates and OTP tools
│   ├── server.js           # Server initializer
│   └── package.json        # Server scripts and dependencies
├── vercel.json             # Monorepo single-deployment configurations for Vercel
├── .gitignore              # Ignoring node_modules and local environment configurations
└── README.md               # App documentation
```

---

## Environment Variables

### Backend Server (`server/`)
Create a `.env` file inside the `server/` directory and configure the variables:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Local server listening port | `5000` |
| `NODE_ENV` | Mode of operation | `development` or `production` |
| `JWT_SECRET` | Secure string for signing JWTs | `supersecretpassphrasestring` |
| `MONGODB_URI` | Database connection URL | `mongodb://localhost:27017/spendly` |
| `SMTP_HOST` | Email SMTP host address | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP port number | `587` |
| `SMTP_USER` | Email account for OTP delivery | `your_address@gmail.com` |
| `SMTP_PASS` | Gmail app password | `xxxx xxxx xxxx xxxx` |

### Frontend Client (`client/`)
Create a `.env` file inside the `client/` directory (optional):

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Destination address for REST calls | `http://localhost:5000/api` |

---

## Local Setup Guide

1. **Clone the project**:
   ```bash
   git clone https://github.com/bitkaran/spendly.git
   cd spendly
   ```

2. **Install all dependencies**:
   Install monorepo root, frontend, and backend packages with the root script helper:
   ```bash
   npm run install:all
   ```

3. **Configure Environments**:
   Copy `.env.example` templates to `.env` inside `server/` and `client/` folders and insert your values. (Note: `.env` files are ignored by Git).

4. **Run Dev Environment**:
   Start both frontend Vite server and backend API server simultaneously:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Backend API Endpoints

All endpoints (except signup, verification, login, forgot password) require an `Authorization: Bearer <JWT_Token>` request header.

### 1. Authentication
* `POST /api/auth/signup` - Register user. Requires name, valid email, and password (min 6 characters).
* `POST /api/auth/verify-otp` - Verify email. Activates account, seeds default categories, and returns JWT.
* `POST /api/auth/login` - Validate credentials. Sends fresh OTP if account is not yet verified.
* `POST /api/auth/forgot-password` - Requests reset password OTP code.
* `POST /api/auth/reset-password` - Checks recovery OTP and writes new password (min 6 characters).
* `GET /api/auth/me` - Validates session.

### 2. Expenses
* `GET /api/expenses` - Get expenses. Params: `from`, `to`, `category`, `paymentMode`, `minAmount`, `maxAmount`, `search`.
* `POST /api/expenses` - Create expense.
* `GET /api/expenses/:id` - Fetch single entry.
* `PUT /api/expenses/:id` - Edit expense details.
* `DELETE /api/expenses/:id` - Erase expense record.

### 3. Categories
* `GET /api/categories` - Returns combined default system categories and user-specific custom ones.
* `POST /api/categories` - Create custom category label. Prevents duplicates.
* `PUT /api/categories/:id` - Update custom category name. (Fails on system default categories).
* `DELETE /api/categories/:id` - Remove custom category. (Fails on system default categories).

### 4. Analytics & Calculations
* `GET /api/analytics/summary` - Today/month total and 5 recent logs.
* `GET /api/analytics/category-total` - Spending sums sorted by category.
* `GET /api/analytics/monthly` - Spending history totals for the past 6 months.
* `GET /api/analytics/custom-total` - Formulated calculators. Requires `from`, `to`, and `category`.

### 5. Exports
* `GET /api/export/excel` - Returns structured, formatted spreadsheet streams conforming to selected filters.

---

## Deployment Guide

### Database Setup (MongoDB Atlas)
1. Register at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Free tier Cluster, add a Database User with password, and allow IP connection requests from anywhere (`0.0.0.0/0`).
3. Copy the cluster connection string to your backend environment configurations.

### Recommended Split Deployments
Because full-stack Express monoliths inside serverless Vercel setups can exceed memory limits or have cold starts:

#### Backend API (Render or Railway)
1. Link your project on Render/Railway.
2. Set directory root to `server/`.
3. Set Start command: `npm start`.
4. Add environment variables from your `.env` configuration.
5. Copy the live API URL (e.g. `https://spendly-api.onrender.com`).

#### Frontend Client (Vercel)
1. Deploy on Vercel.
2. Set directory root to `client/`.
3. Select configuration as Vite / React.
4. Add Environment Variable: `VITE_API_URL=https://spendly-api.onrender.com/api`.
5. Deploy.

---

## Screenshots Section Placeholder

*(Add your app screen mockups here!)*

| Login Screen | Dashboard | Statement | Analytics |
| :---: | :---: | :---: | :---: |
| [Placeholder] | [Placeholder] | [Placeholder] | [Placeholder] |

---

## Future Improvements

* [ ] Add optical character recognition (OCR) scanner to extract details from receipt photos.
* [ ] Integrate recurring bills / subscriptions automation.
* [ ] Add notifications for monthly budget caps.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
