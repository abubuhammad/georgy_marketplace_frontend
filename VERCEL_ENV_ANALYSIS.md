# Frontend-Backend Environment Variable Analysis

## Current Status
- **Frontend**: Vercel (deployed at `https://shopping-market-redesign.vercel.app`)
- **Backend**: Render (deployed at `https://georgy-marketplace-backend.onrender.com`)
- **Issue**: Frontend is not in sync with backend API URL

---

## Environment Variable Requirements

### Frontend (Vercel) - REQUIRED Variables

The frontend looks for these variables (in order of precedence):

| Variable | Purpose | Current Value | Required Value |
|----------|---------|----------------|-----------------|
| `VITE_API_BASE_URL` | **PRIMARY** - Backend API endpoint | Not set | `https://georgy-marketplace-backend.onrender.com/api` |
| `VITE_WS_URL` | WebSocket connection URL (optional, defaults to ws version of origin) | Not set | `wss://georgy-marketplace-backend.onrender.com` |
| `VITE_DEV_MODE` | Enable mock data fallback (for development) | `true` | `false` (production) |

### Backend (Render) - Already Configured

Your backend is deployed with:
- **Service**: `georgy-marketplace-backend`
- **URL**: `https://georgy-marketplace-backend.onrender.com`
- **Health Check**: `/api/health` ✅
- **Port**: 10000 (internal, mapped by Render)
- **Environment**: `NODE_ENV=production`
- **CORS**: Configured to accept requests from localhost, 192.168.x.x, and expo apps

---

## Frontend API Configuration Files

Your frontend has 3 different API clients looking for env vars:

### 1. Primary Config (`src/config/index.ts`)
```typescript
BASE_URL: isDevelopment 
  ? import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
  : import.meta.env.VITE_API_BASE_URL || '/api',  // Falls back to relative path in prod
```

### 2. API Client (`src/services/apiClient.ts`)
```typescript
baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
```

### 3. Legacy Clients (may need updates)
- `src/lib/api-client.ts` - Uses `VITE_API_BASE_URL`
- `src/lib/apiClient.ts` - Uses `VITE_API_URL` (inconsistent naming)
- `src/services/DeliveryMatchingService.ts` - Uses `process.env.REACT_APP_API_URL` (wrong for Vite!)

---

## Issues Identified

### ❌ Inconsistent Environment Variable Names
Your code references multiple env var names:
- `VITE_API_BASE_URL` ← **Use this one (Vite standard)**
- `VITE_API_URL` ← Inconsistently used
- `VITE_WS_URL` ← For WebSocket (optional)
- `REACT_APP_API_URL` ← Wrong pattern (React Create App style, not Vite)

### ❌ Fallback Issues
Production config defaults to `/api` (relative path), which won't work with a separate Render domain. The backend CORS is NOT configured for Vercel's domain.

### ⚠️ Backend CORS Missing Vercel Domain
**Current CORS origins:**
```typescript
origin: [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://192.168.0.171:8080',
  'http://localhost:19006', // Expo
  'exp://localhost:19000',
  'exp://192.168.0.171:19000'
]
```

**Missing:**
- `https://shopping-market-redesign.vercel.app` (your frontend)
- `https://*.vercel.app` (Vercel preview deployments)

---

## Step-by-Step Fix

### Step 1: Update Backend CORS (Backend)

Edit `backend/src/server.ts` to include Vercel domain:

```typescript
app.use(cors({
  origin: [
    // ... existing origins ...
    config.frontend.url, // From config
    'https://shopping-market-redesign.vercel.app', // Your Vercel production
    /^https:\/\/.*\.vercel\.app$/, // Vercel preview deployments (regex)
    'http://localhost:8080',
    'http://localhost:5173',
    'http://192.168.0.171:8080',
    'http://localhost:19006', // Expo mobile app
    'exp://localhost:19000',
    'exp://192.168.0.171:19000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Then push to GitHub so Render redeploys.

### Step 2: Add Vercel Environment Variables (Frontend)

In Vercel Dashboard → Your Project → Settings → Environment Variables:

**Production:**
```
VITE_API_BASE_URL=https://georgy-marketplace-backend.onrender.com/api
VITE_WS_URL=wss://georgy-marketplace-backend.onrender.com
VITE_DEV_MODE=false
```

**Preview (optional, for PR testing):**
```
VITE_API_BASE_URL=https://georgy-marketplace-backend.onrender.com/api
VITE_WS_URL=wss://georgy-marketplace-backend.onrender.com
VITE_DEV_MODE=false
```

**Development (local):**
```
VITE_API_BASE_URL=http://localhost:5001/api
VITE_WS_URL=ws://localhost:5001
VITE_DEV_MODE=true
```

### Step 3: Standardize Frontend Code (Optional but Recommended)

Replace `REACT_APP_*` with `VITE_*` in `src/services/DeliveryMatchingService.ts`:

```typescript
// Before:
this.apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// After:
this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5001';
```

### Step 4: Redeploy Frontend on Vercel

After setting env vars:
1. Go to Vercel Dashboard → Deployments
2. Click "Redeploy" on latest deployment
3. Or: commit a change to `main` to trigger auto-deploy

---

## Quick Verification

### Test Backend Health
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

### Test Frontend-Backend Connection
1. Open Vercel deployment
2. Open Browser DevTools → Console
3. Try any API call (e.g., login, product fetch)
4. Check Network tab for:
   - ✅ Request goes to `https://georgy-marketplace-backend.onrender.com/api/...`
   - ✅ Response status 200-399 (not 4xx/5xx)
   - ✅ No CORS errors

### Local Testing (Before Vercel Push)
```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
npm run dev

# In browser
curl http://localhost:5001/api/health
curl http://localhost:5173  # Frontend
# Check API calls in DevTools
```

---

## Summary Table

| Environment | VITE_API_BASE_URL | VITE_WS_URL | VITE_DEV_MODE |
|-------------|-------------------|-------------|---------------|
| **Local Dev** | `http://localhost:5001/api` | `ws://localhost:5001` | `true` |
| **Vercel Production** | `https://georgy-marketplace-backend.onrender.com/api` | `wss://georgy-marketplace-backend.onrender.com` | `false` |
| **Render Backend** | N/A (server doesn't consume) | N/A | N/A |

---

## Next Actions

1. ✅ Add Vercel domain to backend CORS
2. ✅ Commit and push backend changes (triggers Render redeploy)
3. ✅ Set env vars in Vercel dashboard
4. ✅ Redeploy frontend on Vercel
5. ✅ Test API calls from frontend to backend
6. ✅ Fix `REACT_APP_*` references in frontend code (optional cleanup)
