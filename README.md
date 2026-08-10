# 📬 HR Mailer Pro

**HR Mailer Pro** is a production-ready, mobile-first, high-performance cold email campaign platform designed for job seekers and recruiters to send personalized HR outreach campaigns directly from their own Gmail account using official Google OAuth 2.0 and the Google Gmail API.

---

## 🌟 Key Features

- 🔐 **Official Google OAuth 2.0 & Gmail API**: Direct delivery from your personal/professional Gmail address. Zero passwords stored.
- 📱 **Mobile-First Apple / Linear Inspired Design**: Fully responsive glassmorphism UI optimized for touchscreens (320px – 1440px+).
- 🧹 **HR Email Extractor**: Accepts raw text input (multi-line, comma-separated, `Google: hr@google.com`). Auto-deduplicates, trims spaces, and displays instant breakdown stats (Total, Valid, Invalid, Duplicates).
- ✉️ **Dynamic Personalization Engine**: Replace variables like `{{company}}`, `{{name}}`, `{{email}}`, and `{{greeting}}` automatically with live preview support.
- 📁 **Attachment Manager**: Drag & drop PDF, DOC, DOCX up to 20MB (Resume, Cover Letter, Certificates).
- ⏱️ **Random Jitter Sending Engine**: Configurable random delay (10–25s) and automatic 3x retry on transient errors to protect domain reputation and prevent Google rate limits.
- ⏸️ **Real-time Queue Controls**: Pause, Resume, or Cancel active campaign queues on the fly. Track speed (emails/min), elapsed time, and ETA.
- 📊 **CSV & Excel Reports**: Export campaign logs as CSV or Excel (XLSX) spreadsheets.
- 🌙 **Dark / Light / Auto Theme**: Apple-inspired dark mode by default with light mode and system preference auto-detection.
- 🛡️ **Cybersecurity Hardened**: AES-256-GCM encrypted refresh tokens, Helmet security headers, Express rate limiting, XSS sanitization, CSRF tokens, and parameterized SQLite queries.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Node.js**: v18.x or higher
- **NPM**: v9.x or higher

### 1. Install Dependencies
```bash
npm run setup
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

> **Instant Preview Mode**: By default, `.env` comes pre-configured with `ENABLE_MOCK_AUTH=true`. This allows you to explore the full dashboard, email parser, composer, attachments, sending engine, and reports without setting up Google API credentials first!

### 3. Launch the Server
```bash
npm start
```
Open your browser and navigate to: **`http://localhost:5000`**

---

## 🔑 Google Cloud OAuth 2.0 & Gmail API Setup Guide

When you are ready to send real emails from your Gmail account:

### Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a Project** -> **New Project**, name it `HR Mailer Pro`, and click **Create**.

### Step 2: Enable the Gmail API
1. In the left sidebar, navigate to **APIs & Services** -> **Library**.
2. Search for **Gmail API**.
3. Click on **Gmail API** and press **Enable**.

### Step 3: Configure OAuth Consent Screen
1. Go to **APIs & Services** -> **OAuth consent screen**.
2. Select **External** (or Internal for Workspace) and click **Create**.
3. Fill in the App Information (App Name: `HR Mailer Pro`, User Support Email, Developer Contact).
4. In the **Scopes** step, click **Add or Remove Scopes** and select:
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/gmail.send`
5. Save and add your Gmail address as a **Test User** (if app status is Testing).

### Step 4: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** -> **Credentials**.
2. Click **Create Credentials** -> **OAuth client ID**.
3. Select **Web application** as the Application type.
4. Set **Authorized redirect URIs**:
   - Local: `http://localhost:5000/api/v1/auth/google/callback`
   - Production (Render): `https://your-app.onrender.com/api/v1/auth/google/callback`
5. Click **Create**. Copy the generated **Client ID** and **Client Secret**.

### Step 5: Update Your `.env`
Set `ENABLE_MOCK_AUTH=false` and paste your credentials:
```env
ENABLE_MOCK_AUTH=false
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
```

---

## 🌐 Deploying to Render.com

Render supports full Node.js web applications with persistent SQLite disks:

1. Push your repository to GitHub / GitLab.
2. Log into [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprint**.
4. Connect your repository containing `render.yaml`.
5. Render will automatically detect the configuration, allocate a 1GB persistent disk for SQLite, and deploy!
6. Add your production environment variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`) under the Service Settings.

---

## ⚡ Deploying to Vercel

If you want to host on Vercel:

1. Import the repository into your Vercel Dashboard.
2. Vercel will automatically read `vercel.json`.
3. Set your environment variables in the Vercel Project Settings.

---

## 🔒 Cyber Security Architecture

- **Token Encryption**: Refresh tokens are encrypted with AES-256-GCM before saving to the SQLite database.
- **CSRF & XSS Protection**: All user input text is sanitized using XSS filters and HTTP requests require valid CSRF tokens.
- **SQL Injection Safeguards**: All database queries are executed via standard SQLite parameterized statements.
- **HTTP Security Headers**: Configured with Helmet to enforce HSTS, X-Frame-Options, and Frameguard protection.
- **Rate Limiting**: Protects authentication and general endpoints against brute-force and DDoS attempts.

---

## 📄 License
MIT License. Built with precision and care.
