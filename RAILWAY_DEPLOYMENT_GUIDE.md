# Railway Deployment Guide - Frontend Only

## Overview
This guide deploys **only the React/Vite frontend** to Railway Static Sites, keeping your Node.js/Express backend private.

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository connected to Railway
- Backend API deployed separately (see Backend Deployment Options below)

## Quick Deploy (3 Steps)

### 1. Push Configuration Files
Copy these files to your repository root:
- `railway.json` - Railway service configuration
- `.railwayignore` - Excludes backend/mobile from deployment
- `nixpacks.toml` - Build configuration (optional, Railway auto-detects)

### 2. Create Railway Project
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `mathew-Ronoh/university-system`
4. Railway will detect the `railway.json` and deploy only `frontend/`

### 3. Configure Environment Variables
In Railway dashboard → Your Service → Variables, add:
```
VITE_API_BASE_URL=https://your-backend-api.com/api
VITE_APP_NAME=University System
VITE_ENABLE_MPESA=true
VITE_ENABLE_HELB=true
```

## File Structure After Setup
```
university-system/
├── railway.json          # ← Railway config (deploy frontend only)
├── .railwayignore        # ← Excludes backend/mobile
├── nixpacks.toml         # ← Optional: explicit build config
├── frontend/             # ← ONLY this folder gets deployed
│   ├── .env.production.example
│   ├── vite.config.js    # ← Updated for production base path
│   ├── package.json
│   └── src/
├── src/                  # ← Backend (NOT deployed)
├── server.js             # ← Backend entry (NOT deployed)
├── mobile/               # ← React Native (NOT deployed)
└── database/             # ← DB migrations (NOT deployed)
```

## Backend Deployment Options (Separate)

Since backend stays private, deploy it to one of:

### Option A: Render (Free tier available)
```yaml
# render.yaml in backend repo
services:
  - type: web
    name: university-api
    env: node
    buildCommand: npm ci
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase: university-db
```

### Option B: Fly.io
```toml
# fly.toml in backend repo
app = "university-api"
primary_region = "iad"
[build]
  builder = "paketobuildpacks/builder:base"
[env]
  NODE_ENV = "production"
[http_service]
  internal_port = 3000
  force_https = true
```

### Option C: VPS (DigitalOcean, Linode, Hetzner)
- Use PM2 + Nginx reverse proxy
- Configure SSL with Let's Encrypt
- Set up systemd service for auto-restart

### Option D: Railway (Separate Private Project)
1. Create a **private** GitHub repo for backend only
2. Deploy to separate Railway project
3. Use Railway's private networking for DB

## Mobile App (React Native) Deployment

Railway doesn't host React Native apps. Use:

### Expo EAS (Recommended)
```bash
cd mobile
npm install -g eas-cli
eas login
eas build --platform all
eas submit --platform all
```

### Direct Builds
- **Android**: `cd mobile && ./gradlew assembleRelease`
- **iOS**: `cd mobile/ios && xcodebuild -workspace ...`

## Environment Variable Mapping

| Frontend Var | Backend Equivalent | Description |
|-------------|-------------------|-------------|
| `VITE_API_BASE_URL` | `config.apiUrl` | Backend API endpoint |
| `VITE_ENABLE_MPESA` | `MPESA_CONSUMER_KEY` | Enable M-Pesa payments |
| `VITE_ENABLE_HELB` | `HELB_API_KEY` | Enable HELB integration |

## Security Checklist

- [ ] Backend repo is **private** on GitHub
- [ ] `.env` files in `.gitignore` (both frontend & backend)
- [ ] Railway variables set in dashboard (not in code)
- [ ] CORS configured in backend for frontend domain only
- [ ] JWT secrets rotated and strong
- [ ] Database credentials not in frontend
- [ ] M-Pesa/HELB credentials only in backend

## Custom Domain Setup

1. Railway Dashboard → Service → Settings → Domains
2. Add custom domain: `app.university-system.com`
3. Configure DNS CNAME to `xxx.up.railway.app`
4. Update `VITE_API_BASE_URL` to use API subdomain: `api.university-system.com`

## Troubleshooting

### Build Fails
- Check Node version: Railway uses 20.x by default
- Verify `npm ci` works locally
- Check for TypeScript errors if using TS

### API Calls Fail
- Verify `VITE_API_BASE_URL` in Railway variables
- Check backend CORS allows frontend domain
- Ensure backend is accessible (not blocked by firewall)

### Assets 404
- Ensure `vite.config.js` has `base: './'` for production
- Check `dist/` folder structure after build

## Monitoring
- Railway provides basic logs in dashboard
- Add Sentry/LogRocket for frontend error tracking
- Backend should have its own monitoring (Datadog, New Relic, etc.)

## Cost Estimation
- **Railway Static Site**: ~$5/month (or free tier)
- **Backend (Render/Fly/VPS)**: $5-20/month
- **Database (Railway MySQL)**: $5/month
- **Total**: ~$15-30/month for full stack

---

## Quick Commands Reference

```bash
# Local development
cd frontend && npm run dev

# Test production build locally
cd frontend && npm run build && npx serve -s dist

# Deploy to Railway (auto on push to main)
git add railway.json .railwayignore nixpacks.toml frontend/vite.config.js
git commit -m "Add Railway frontend deployment config"
git push origin main

# Check Railway logs
railway logs  # if using Railway CLI
```