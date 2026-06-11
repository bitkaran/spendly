# Deployment Checklist - Spendly

Use this step-by-step checklist to configure, deploy, and verify the production environment of the **Spendly** expense tracker application.

---

## 1. MongoDB Atlas Cloud Database Setup

- [ ] **Create MongoDB Atlas Account / Project**:
  - Sign in or register at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
  - Create a new project named `Spendly`.
- [ ] **Provision Free Database Cluster**:
  - Click **Create Database** and select the **M0 Shared Free Tier** cluster option.
  - Choose a cloud provider region closest to your server location (e.g. AWS Singapore/Mumbai/N. Virginia) and click **Create**.
- [ ] **Configure Security Credentials (User)**:
  - Go to **Security > Database Access** and click **Add New Database User**.
  - Set password-based authentication. Choose a username (e.g. `spendly_admin`) and a secure password.
  - Assign user privileges as **Read and write to any database**. Click **Add User**.
- [ ] **Whitelisted Dynamic Access (Network)**:
  - Go to **Security > Network Access** and click **Add IP Address**.
  - Click **Allow Access from Anywhere** (adds `0.0.0.0/0` to network list). This is required because Vercel/Render server instances route database connections through dynamically changing IP addresses.
  - Click **Confirm**.
- [ ] **Retrieve Connection String**:
  - Go to the **Clusters** tab and click **Connect**.
  - Choose **Drivers** under connection methods.
  - Copy the connection URI string.
  - In the copied string, replace `<username>` and `<password>` with your database user credentials. Add the database name `/spendly` right before the query parameters (before `?retryWrites=...`) to ensure data writes to the correct collections.

---

## 2. Vercel Full-Stack Monorepo Deployment

- [ ] **Import Repository**:
  - Log in to your [Vercel Project Dashboard](https://vercel.com/).
  - Select **Add New > Project** and import the repository **`bitkaran/spendly`**.
- [ ] **Configure Build and Settings**:
  - Keep the **Root Directory** as the root of the project `./` (do not change it to `client` or `server`).
  - Vercel will automatically read `vercel.json` to configure frontend static building and serverless API compilation.
- [ ] **Configure Environment Variables**:
  Add the following parameters inside the environment configuration panel on Vercel:
  - `NODE_ENV` = `production`
  - `MONGODB_URI` = *Your MongoDB Atlas connection URI retrieved in Step 1*
  - `JWT_SECRET` = *A long secure random secret key passphrase*
  - `JWT_EXPIRES_IN` = `7d`
  - `CLIENT_URL` = *Your Vercel deployment URL (e.g. `https://spendly.vercel.app`)*
  - `SMTP_HOST` = `smtp.gmail.com`
  - `SMTP_PORT` = `587`
  - `SMTP_USER` = *Your email address*
  - `SMTP_PASS` = *Your Gmail app password*
  - `SMTP_FROM` = `Spendly <your_email_address>`
- [ ] **Deploy Application**:
  - Click **Deploy**. Vercel will compile the React bundle and backend serverless endpoints.
  - Copy the generated live Vercel URL.
- [ ] **Verify Live API Health**:
  - Visit the live health check endpoint:
    `https://your-vercel-app-name.vercel.app/api/health`
  - Confirm the JSON payload returns database status `"connected"`.

---

## 4. Post-Deployment Verification

Perform a manual E2E check on the live Vercel URL:

- [ ] **Registration Flow**: Signup with a new name, email, and password. Confirm the app logs you in automatically and redirects directly to the dashboard.
- [ ] **Sign In Session**: Sign out and log back in to check credentials and session persistence.
- [ ] **Add Transaction**: Add a test expense (e.g., ₹150 for Lunch, UPI). Confirm dashboard totals and progress meters update.
- [ ] **Statement Search & Filters**: Search statements by remark and toggle filtering bounds. Confirm data isolates correctly.
- [ ] **Excel Download**: Click **Export Excel** in the Statement tab. Open the generated spreadsheet and check cell formats.
- [ ] **Recharts Visuals**: Go to the Analytics tab and check that Doughnut and Area charts render dynamically.
- [ ] **Custom Calculator**: Select a date range and verify the calculated averages and peak values are accurate.
- [ ] **Logout Session**: Sign out of the profile page to confirm token cleanups.

---

## 5. Production Operations Notes

> [!CAUTION]
> **Production Guidelines**:
> 1. **No local database fallbacks**: Never attempt to run local database instances (`localhost`) in hosted production environments.
> 2. **Environment Protection**: Never check in `.env` credentials files to GitHub. Only share `.env.example` templates.
> 3. **CORS / Client URL**: Update the `CLIENT_URL` environment variable inside your Vercel project settings to match your custom domain or production subdomain to secure cookies and token settings.
