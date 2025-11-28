# Vercel Environment Variables Setup Guide

## Quick Steps to Sync Frontend with Backend

Your backend is deployed on Render at: `https://georgy-marketplace-backend.onrender.com`
Your frontend is deployed on Vercel at: `https://georgy-marketplace-frontend.vercel.app`

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your project: `georgy-marketplace-frontend`

### Step 2: Add Environment Variables
1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)
3. Add these three variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://georgy-marketplace-backend.onrender.com/api` | Production, Preview |
| `VITE_WS_URL` | `wss://georgy-marketplace-backend.onrender.com` | Production, Preview |
| `VITE_DEV_MODE` | `false` | Production, Preview |

**Important**: For each variable, select both **Production** and **Preview** checkboxes.

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Wait for the build to complete (usually 2-3 minutes)

Or simply push a commit to trigger auto-deploy:
```bash
git add .
git commit -m "chore: trigger vercel redeploy"
git push origin main
```

### Step 4: Verify
1. Visit your Vercel deployment: https://georgy-marketplace-frontend.vercel.app
2. Open Browser DevTools (F12)
3. Go to **Network** tab
4. Perform an action (like loading products or logging in)
5. Check that API calls go to `https://georgy-marketplace-backend.onrender.com/api/...` (not localhost)

---

## Local Development Setup

If you want to test locally with your backend also running locally:

### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
```
Backend will run on `http://localhost:5001` (or whatever port you configured)

### Terminal 2: Frontend
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

The `.env.local` file is already configured to point to `http://localhost:5001/api` for local development.

---

## How Environment Variables Work

- **Local Dev** (`.env.local`): Used by `npm run dev` on your machine
- **Vercel Production** (Dashboard): Used by deployed site at `georgy-marketplace-frontend.vercel.app`
- **Vercel Preview** (Dashboard): Used by PR preview deployments

The frontend code reads these with:
```typescript
import.meta.env.VITE_API_BASE_URL  // e.g., "https://georgy-marketplace-backend.onrender.com/api"
```

---

## Troubleshooting

### Issue: API calls still going to localhost
**Solution**: 
1. Confirm variables are set in Vercel dashboard
2. Confirm both **Production** AND **Preview** are checked
3. Redeploy the site (Deployments → Redeploy)
4. Wait 30 seconds and hard-refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: CORS errors in DevTools console
**Solution**: The backend CORS has been updated to allow `georgy-marketplace-frontend.vercel.app`. Wait for Render to redeploy the latest backend commit.

### Issue: 404 on logo images
**Solution**: This is expected if images aren't deployed. Not critical for API testing.

### Issue: Still using mock data
**Solution**: Check that API calls show in Network tab and verify they're calling the correct Render URL (not localhost).

---

## Backend Health Check

To verify the backend is working:
```bash
curl https://georgy-marketplace-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-28T...",
  "uptime": 123.45,
  "environment": "production"
}
```
