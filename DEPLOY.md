# Deployment Guide — ShreeMadhav on Vercel + Railway

## Problem
The frontend on Vercel calls `/api` for data (services, jobs, applications, enquiries etc.).  
Vercel only serves the static React build — the Node.js + MySQL backend must run elsewhere.

## Solution: Vercel (frontend) + Railway (backend + MySQL)

---

## Step 1 — Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Select your repository and set the **Root Directory** to `backend`
3. Railway will auto-detect Node.js. Set these **Environment Variables** in Railway dashboard:

```
NODE_ENV=production
PORT=5000
TRUST_PROXY=true
SERVE_FRONTEND=false

DB_HOST=<railway mysql host>
DB_PORT=<railway mysql port>
DB_USER=<railway mysql user>
DB_PASSWORD=<railway mysql password>
DB_NAME=railway

JWT_SECRET=<64+ random characters>
JWT_EXPIRES_IN=8h
COOKIE_NAME=smos_session

UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
MAX_SUPPORTING_FILES=4

CORS_ORIGINS=https://shreemadhav-cqm7.vercel.app
```

4. Add a **MySQL plugin** in Railway → it auto-fills `DB_*` variables
5. After deploy, run the migration:
   ```
   railway run node scripts/migrate.js
   railway run node scripts/seed.js
   ```
6. Note your backend URL, e.g. `https://shreemadhav-api-production.up.railway.app`

---

## Step 2 — Update vercel.json with your backend URL

Edit `vercel.json` in the project root and replace `YOUR_BACKEND_URL`:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR_RAILWAY_URL/api/:path*"
    },
    ...
  ]
}
```

---

## Step 3 — Set Vercel Environment Variables

In Vercel dashboard → Project Settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `VITE_SITE_URL` | `https://shreemadhav-cqm7.vercel.app` |
| `VITE_API_BASE_URL` | `/api` |

> `VITE_API_BASE_URL` stays `/api` because `vercel.json` rewrites `/api/*` to your Railway backend.

---

## Step 4 — Redeploy on Vercel

Push your changes (including updated `vercel.json`) to GitHub. Vercel will auto-deploy.

---

## Alternative: Same-server deployment (VPS/Linux)

See `docs/DEPLOYMENT.md` for Nginx + PM2 setup on a VPS.
This is simpler for production: Nginx serves the React build AND proxies `/api/` to Node.js.
