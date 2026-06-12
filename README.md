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

1. **User Authentication**:
   - Secure account registration with direct login.
   - JWT-based login sessions with visual password toggles.
   - Strict session routes protection (each user can *only* access their own transactions).

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

## Install Spendly as an App

Spendly supports Progressive Web App (PWA) capabilities, allowing it to be installed on your mobile device or desktop to run in standalone native app mode.

### On iOS (Safari):
1. Open Safari and navigate to your deployed Spendly URL.
2. Tap the **Share** button (upward arrow icon) in the toolbar.
3. Scroll down and select **Add to Home Screen**.
4. Tap **Add**. Spendly will appear on your home screen with its premium icon and launch in full-screen standalone mode.

### On Android (Chrome / Edge):
1. Open Chrome and navigate to your Spendly URL.
2. Tap the **Install App** prompt at the bottom of the screen (or open the top-right menu and select **Install App**).
3. Confirm the prompt. The app will install with its native splash screen.

### On Desktop (Chrome / Edge):
1. Open Chrome/Edge and visit the app URL.
2. Click the **Install** icon (monitor/arrow down symbol) on the right side of the address bar.
3. Click **Install**.

### PWA Troubleshooting & Verification Checklist:
If the install option is not showing up or is disabled:
- **Check connection protocol**: Ensure you are using `https://` (unless running locally on `http://localhost`). Service Workers and manifest installations are blocked on insecure connections.
- **Standalone Mode check**: If you're already running the app inside its standalone frame, the Install prompt is hidden (you've successfully installed it).
- **Service Worker status**: Open Chrome DevTools > Application > Service Workers and verify `sw.js` is registered, active, and running.
- **Manifest validation**: Ensure `/manifest.json` is served with valid configurations: `start_url` = `/`, `display` = `standalone`, and scope = `/`.
- **Browser limits**: Some browsers (such as Firefox on iOS or Brave with strict shields) disable native install prompt triggers. Use iOS Safari or Android Chrome for the native install prompt flow.

---

## Folder Structure

```
spendly/
├── client/                 # Frontend React + Vite SPA
├── server/                 # Backend Node + Express API
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
| `JWT_EXPIRES_IN`| Token expiry duration | `30d` |
| `MONGODB_URI` | Database connection URL (Required in production) | `mongodb+srv://...` |
| `CLIENT_URL` | Frontend URL for CORS whitelisting | `https://spendly.vercel.app` |

### Frontend Client (`client/`)
Create a `.env` file inside the `client/` directory (optional):

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Destination address for REST calls | `http://localhost:5000/api` |

---

## MongoDB Atlas Database Setup

> [!IMPORTANT]
> **Production Database Rule**: Production instances (e.g. running on Vercel/Render) **MUST** connect to a cloud MongoDB Atlas instance. Local `localhost` MongoDB connection URIs will fail when hosted on serverless providers.

To set up your cloud database:

1. **Create a Free Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register a free account.
   - Click **Create Database** and select the **M0 Shared Free Tier** cluster option.
   - Choose your nearest cloud provider region (e.g., AWS / Mumbai or N. Virginia) and click **Create**.

2. **Configure Database Access User**:
   - In the Security section on the left sidebar, click **Database Access**.
   - Click **Add New Database User**.
   - Set Authentication Method to **Password**. Enter a Username (e.g. `spendly_admin`) and a secure Password.
   - Assign user privileges as **Read and write to any database**. Click **Add User**.

3. **Configure Network IP Access (Whitelist)**:
   - In the Security section, click **Network Access**.
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (this writes `0.0.0.0/0` to your whitelist). This is required because serverless hosting providers route traffic from dynamically changing IP addresses.
   - Click **Confirm**.

4. **Retrieve Connection URI String**:
   - Navigate back to the **Database / Clusters** tab and click **Connect**.
   - Select **Drivers** under connection methods.
   - Copy the provided connection string (URI), which looks like:
     `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
   - Paste this string into your backend environment configuration as the `MONGODB_URI` value, replacing `<username>` and `<password>` with your database user credentials.

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

All endpoints (except signup, login, health check) require an `Authorization: Bearer <JWT_Token>` request header.

* `GET /api/health` - Public endpoint checking database connection state.
* `POST /api/auth/signup` - Register user and directly login.
* `POST /api/auth/login` - Validate credentials.
* `GET /api/auth/me` - Validates session.
* `GET /api/expenses` - Get user-scoped expenses. Params: `from`, `to`, `category`, `paymentMode`, `minAmount`, `maxAmount`, `search`.
* `POST /api/expenses` - Log an expense.
* `PUT /api/expenses/:id` - Edit expense details.
* `DELETE /api/expenses/:id` - Erase expense record.
* `GET /api/categories` - Returns combined system default and custom categories.
* `POST /api/categories` - Create custom category.
* `DELETE /api/categories/:id` - Remove custom category.
* `GET /api/analytics/summary` - Today/month total and recent logs.
* `GET /api/analytics/category-total` - Spending sums sorted by category.
* `GET /api/analytics/monthly` - Spending history totals for the past 6 months.
* `GET /api/analytics/custom-total` - Formulated calculator values.
* `GET /api/export/excel` - Returns formatted Excel sheet streams of statements.

---

## Vercel Full-Stack Monorepo Deployment Guide (Main)

To deploy both the frontend React app and backend Node.js Serverless APIs on **Vercel**:

### 1. Import Project on Vercel
1. Log in to your [Vercel Project Dashboard](https://vercel.com/).
2. Select **Add New > Project** and import your repository: **`bitkaran/spendly`**.

### 2. Configure Monorepo Settings
Specify the following configuration in the creation form:
* **Framework Preset**: Keep as **Other** (Vercel will automatically read `vercel.json` at the root).
* **Root Directory**: Keep as the root directory `./` (do not change it to `client` or `server`).

### 3. Add Production Environment Variables
Click **Environment Variables** and add the following keys:

| Key | Value | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Node environment |
| `MONGODB_URI` | *Your MongoDB Atlas connection string* | `mongodb+srv://...` |
| `JWT_SECRET` | *A long secure random secret key* | `your_long_secure_secret_passphrase_here` |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `CLIENT_URL` | *Your Vercel deployment URL* | `https://spendly.vercel.app` |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP host address |
| `SMTP_PORT` | `587` | SMTP port number |
| `SMTP_USER` | *Your email address* | `your_email@gmail.com` |
| `SMTP_PASS` | *Your Gmail app password* | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | *Your email template* | `Spendly <your_email@gmail.com>` |

### 4. Deploy and Verify
* Click **Deploy**. Vercel will build your static client assets and construct serverless API functions automatically.
* Once the build completes, visit your live app's health endpoint:
  `https://your-vercel-app-name.vercel.app/api/health`
* Confirm the JSON payload returns database status `"connected"`.

---

## Render Backend Deployment Guide (Optional)

To deploy the Node.js/Express backend on **Render** instead:

### 1. Create Web Service
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Link your GitHub account and select your repository: **`bitkaran/spendly`**.

### 2. Configure Service Settings
* **Root Directory**: `server`
* **Runtime**: `Node`
* **Build Command**: `npm install`
* **Start Command**: `npm start`
* **Instance Type**: Select **Free** tier

### 3. Add Environment Variables
* Configure `NODE_ENV`, `PORT` = `10000`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `CLIENT_URL`.

---

## Production Security Regulations

> [!CAUTION]
> **Safety Regulations**:
> 1. **MongoDB Connection**: Never connect the production instance to a local `localhost` database. You must utilize MongoDB Atlas.
> 2. **Environment Variables**: Never commit `.env` files into source control repositories. Always add credentials inside the Vercel/Render project dashboard.

---

## Deployment Health Verification

After the Vercel deployment succeeds and status marks **Ready** / **Live**:
1. Open a browser or postman client and send a GET request to:
   `https://your-vercel-app-name.vercel.app/api/health`
2. Confirm the response returns status `200` with the following structure:
   ```json
   {
     "status": "ok",
     "app": "Spendly",
     "database": "connected",
     "timestamp": "..."
   }
   ```
3. If database status returns `"disconnected"`, check the cluster credentials and IP whitelisting settings inside the Atlas panel.

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
