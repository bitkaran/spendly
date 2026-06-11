# Vercel Full-Stack Deployment Guide - Spendly

Spendly is configured as a full-stack React + Express monorepo deployable entirely on **Vercel** without any external application hosting services (like Render or Railway). The React frontend is built statically, and the Express backend is compiled into Vercel Serverless Functions.

---

## 1. Vercel Project Configuration

When importing your project repository (`bitkaran/spendly`) on Vercel, configure the following settings:

* **Framework Preset:** `Other` (Vercel will read configuration definitions directly from the root `vercel.json`).
* **Root Directory:** `./` (Keep this as the project root. **Do NOT** change it to `client` or `server`).
* **Build Command:** *Leave blank* (Vercel uses the build definitions inside `vercel.json`).
* **Output Directory:** *Leave blank*.

---

## 2. Production Environment Variables

Configure these keys inside the **Project Settings > Environment Variables** panel on Vercel:

| Key | Value | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production configurations |
| `MONGODB_URI` | *Your MongoDB Atlas connection URI* | `mongodb+srv://...` |
| `JWT_SECRET` | *A long secure random secret key* | `your_long_secure_secret_passphrase_here` |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `CLIENT_URL` | *Your Vercel deployment URL* | `https://spendly.vercel.app` |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP host address |
| `SMTP_PORT` | `587` | SMTP port number |
| `SMTP_USER` | *Your email address* | `your_email@gmail.com` |
| `SMTP_PASS` | *Your Gmail app password* | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | *Your email template* | `Spendly <your_email@gmail.com>` |

---

## 3. Deployment Health Verification

After the build succeeds:
1. Visit your live app's health endpoint:
   `https://your-vercel-app-name.vercel.app/api/health`
2. Ensure the returned JSON returns `"database": "connected"` and status `"ok"`:
   ```json
   {
     "status": "ok",
     "app": "Spendly",
     "database": "connected",
     "timestamp": "2026-06-11T18:15:00.000Z"
   }
   ```

---

## 4. Common Deployment Errors & Fixes

### Database Timeout or "disconnected" Status
* **Symptom:** API loads but requests fail or `/api/health` shows `"database": "disconnected"`.
* **Fix:** Ensure you have added network access `0.0.0.0/0` (Allow Access from Anywhere) in your MongoDB Atlas console. Vercel uses dynamic IP addresses, so blocking connections by specific IPs will prevent backend authentication.

### Express Routing (404 errors)
* **Symptom:** `/api/health` works but routes like `/api/auth/login` return `404 Not Found`.
* **Fix:** Confirm `vercel.json` has a wildcard mapping (`/api(.*)` to `api/index.js`) to capture both root requests and nested sub-directories.

### CommonJS / ES Modules syntax errors
* **Symptom:** Build fails with `Cannot use import statement outside a module` on `api/index.js`.
* **Fix:** The root `package.json` must contain `"type": "module"` so Vercel compiles the entrypoint using ES Modules matching the server directory.
