# Cloudflare Pages Deployment Guide
## Free, Unlimited, Fast Static Hosting for Your React/Vite Frontend

---

## 🎯 Why Cloudflare Pages?

| Feature | Cloudflare Pages |
|---------|------------------|
| **Bandwidth** | Unlimited ✅ |
| **Build Minutes** | Unlimited ✅ |
| **Custom Domains** | Free ✅ |
| **SSL/HTTPS** | Auto ✅ |
| **Edge Network** | 300+ locations ✅ |
| **DDoS Protection** | Free ✅ |
| **Preview Deployments** | Every PR ✅ |
| **Cost** | **$0 Forever** ✅ |

---

## 📋 Prerequisites

1. **GitHub Repository**: `mathew-Ronoh/university-system` (already done)
2. **Cloudflare Account**: Free at https://dash.cloudflare.com/sign-up
3. **Backend API**: Deployed separately (Render, Fly.io, etc.)

---

## 🚀 Method 1: Dashboard Setup (Easiest, No Config Files Needed)

### Step 1: Create Cloudflare Pages Project

1. Go to **https://dash.cloudflare.com/pages**
2. Click **"Create a project"** → **"Connect to Git"**
3. **Authorize Cloudflare** to access your GitHub
4. Select repository: **`mathew-Ronoh/university-system`**
5. Click **"Begin setup"**

### Step 2: Configure Build Settings

```
Project name: university-frontend
Production branch: main
Build command: cd frontend && npm ci && npm run build
Build output directory: frontend/dist
Root directory: (leave empty)
```

### Step 3: Environment Variables (Important!)

**Before first deploy**, click **"Environment variables"** → **"Add variable"**:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `NODE_VERSION` | `20` | Required for Node 20 |
| `VITE_API_BASE_URL` | `https://your-backend-api.com/api` | Your backend URL |
| `VITE_APP_NAME` | `University System` | App display name |
| `VITE_ENABLE_MPESA` | `true` | Enable M-Pesa features |
| `VITE_ENABLE_HELB` | `true` | Enable HELB features |

> ⚠️ **Never commit secrets to GitHub!** Add these in Cloudflare dashboard only.

### Step 4: Deploy!

Click **"Save and Deploy"** - first build takes 1-2 minutes.

---

## 🚀 Method 2: GitHub Actions (CI/CD with Preview Deployments)

This uses the workflow file I created: `.github/workflows/cloudflare-pages.yml`

### Required GitHub Secrets

Go to **GitHub Repo → Settings → Secrets and variables → Actions → New repository secret**:

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `CLOUDFLARE_ACCOUNT_ID` | `abc123...` | Cloudflare Dashboard → Right sidebar |
| `CLOUDFLARE_API_TOKEN` | `CFAP_...` | Create below |
| `VITE_API_BASE_URL` | `https://api.yourdomain.com/api` | Your backend URL |
| `VITE_APP_NAME` | `University System` | App name |
| `VITE_ENABLE_MPESA` | `true` | Feature flag |
| `VITE_ENABLE_HELB` | `true` | Feature flag |

### Create Cloudflare API Token

1. Go to **https://dash.cloudflare.com/profile/api-tokens**
2. Click **"Create Token"** → **"Custom token"**
3. Configure:
   ```
   Token name: GitHub Actions Deploy
   Permissions:
     - Account → Cloudflare Pages → Edit
     - Zone → Zone → Read (if using custom domain)
   Account Resources: Include → Your Account
   Zone Resources: All zones (or specific)
   ```
4. **Copy the token immediately** - you won't see it again!

---

## 🌐 Custom Domain Setup (Free!)

### Option A: Root Domain (example.com)

1. **Cloudflare Pages Dashboard** → Your project → **Custom domains**
2. Click **"Set up a custom domain"**
3. Enter: `university-system.com`
4. Cloudflare gives you **CNAME targets**:
   ```
   Type: CNAME
   Name: @
   Target: university-frontend.pages.dev
   Proxy: On (orange cloud)
   ```
5. **If using Cloudflare DNS**: Auto-configured ✅
6. **If using external DNS**: Add CNAME record at your registrar

### Option B: Subdomain (app.university-system.com)

1. Same process, but enter: `app.university-system.com`
2. CNAME target: `university-frontend.pages.dev`

### Option C: www Redirect

1. Add second domain: `www.university-system.com`
2. Cloudflare automatically redirects `www` → root

---

## 🔧 Updated `vite.config.js` (Already Done)

Your `frontend/vite.config.js` is already configured correctly:

```js
// Key settings for Cloudflare Pages
export default defineConfig({
  base: './',           // Relative paths work everywhere
  build: {
    outDir: 'dist',     // Matches Cloudflare output dir
    assetsDir: 'assets',
    sourcemap: false,   // Smaller builds
    minify: 'esbuild',  // Fast minification
  },
})
```

---

## 📁 Files in Your Repository

```
university-system/
├── wrangler.toml                    # Cloudflare config (optional)
├── .github/workflows/
│   └── cloudflare-pages.yml         # Auto-deploy on push
├── frontend/
│   ├── vite.config.js               # ✅ Production ready
│   ├── .env.production.example      # Env var template
│   └── package.json                 # Build scripts
└── ... (backend files ignored)
```

---

## 🧪 Test Locally Before Deploy

```bash
cd /home/remi/university-system/frontend

# Install deps
npm ci

# Build for production
npm run build

# Preview locally (serves dist/ folder)
npx serve -s dist -l 3000
# Visit http://localhost:3000
```

**Verify:**
- ✅ No console errors
- ✅ API calls go to `VITE_API_BASE_URL`
- ✅ Routing works (refresh pages)
- ✅ Assets load correctly

---

## 🔄 Deployment Flow

### With Dashboard (Method 1):
```
Push to main → Cloudflare detects → Builds → Deploys → Live
```

### With GitHub Actions (Method 2):
```
Push to main
    ↓
GitHub Actions: Test → Build → Upload artifacts
    ↓
Cloudflare Pages Action: Deploy to production
    ↓
Preview: Every PR gets unique URL (preview-xxx.pages.dev)
Production: https://university-frontend.pages.dev
```

---

## 🐛 Troubleshooting

### Build Fails: "Node version not found"
**Fix:** Add `NODE_VERSION=20` in Cloudflare env vars

### Build Fails: "Module not found"
**Fix:** Check `package.json` has all deps, run `npm ci` locally first

### 404 on Refresh (SPA Routing)
**Fix:** Cloudflare Pages handles SPA automatically with `base: './'`
- If issues: Add `_redirects` file in `frontend/public/`:
  ```
  /*  /index.html  200
  ```

### API Calls Fail (CORS)
**Fix:** Backend must allow your frontend domain:
```js
// Backend CORS config
app.use(cors({
  origin: ['https://university-frontend.pages.dev', 'https://yourdomain.com'],
  credentials: true
}))
```

### Environment Variables Not Working
**Fix:** 
- Must be prefixed with `VITE_` for Vite
- Add in Cloudflare Dashboard → Environment Variables
- Redeploy after adding

---

## 📊 Monitoring & Analytics

### Free Built-in Analytics
1. Cloudflare Dashboard → Pages → Your project → **Analytics**
2. Shows: Requests, bandwidth, unique visitors, errors

### Web Vitals (Performance)
Add to `frontend/src/main.jsx`:
```js
import { webVitals } from 'web-vitals'

webVitals(console.log) // Or send to analytics
```

### Error Tracking (Free Tier)
- **Sentry**: 5K errors/month free
- **LogRocket**: 1K sessions/month free

---

## 💰 Cost Breakdown

| Component | Cost |
|-----------|------|
| Cloudflare Pages | **$0** |
| Custom Domain | **$0** (if using Cloudflare registrar) or ~$10/yr elsewhere |
| SSL Certificate | **$0** |
| Bandwidth | **$0** (Unlimited) |
| Build Minutes | **$0** (Unlimited) |
| **Total** | **$0/month** |

---

## 🎉 You're Ready!

### Quick Checklist:
- [ ] Cloudflare account created
- [ ] GitHub repo connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] First deploy successful
- [ ] Custom domain configured (optional)
- [ ] Backend CORS updated for frontend domain
- [ ] GitHub Actions secrets added (if using CI/CD)

### Your URLs:
- **Production**: `https://university-frontend.pages.dev`
- **Custom**: `https://university-system.com` (after DNS)
- **Previews**: `https://preview-branch-name.university-frontend.pages.dev`

---

## 📞 Need Help?

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Vite + Cloudflare**: https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite-site/
- **GitHub Actions**: https://github.com/cloudflare/pages-action

Your frontend will be globally fast, secure, and **completely free**! 🚀