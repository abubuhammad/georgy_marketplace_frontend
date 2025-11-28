# Render Database Setup for Backend

## Problem
Your Render backend is returning 500 errors because it doesn't have a `DATABASE_URL` environment variable set. Without this, Prisma can't connect to the database.

## Solution

Your backend uses **PostgreSQL** (from `prisma/schema.prisma`).

You have **two options:**

### Option 1: Use Render PostgreSQL (Recommended for production)
1. Go to https://dashboard.render.com
2. Click **New +** → **PostgreSQL** 
3. Enter:
   - **Name**: `georgy-marketplace-db`
   - **Region**: `Ohio` (same as your backend for lower latency)
   - **PostgreSQL Version**: 15
   - **Plan**: Free (or upgrade if needed)
4. Click **Create Database**
5. Wait for database to initialize (~2 minutes)
6. Go to your database instance and copy the **External Database URL**
7. Go to your **backend service** → **Settings** → **Environment Variables**
8. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the External Database URL from step 6
   - Select **Production**
9. Click **Save**
10. Your backend will auto-redeploy with the database connection

### Option 2: Use Supabase (PostgreSQL hosted elsewhere)
1. Create free account at https://supabase.com
2. Create a new project
3. Go to **Settings** → **Database** → Copy the connection string
4. In Render backend settings, add `DATABASE_URL` environment variable with this URL
5. Save and redeploy

### Option 3: Use External PostgreSQL (if you have one)
- If you already have a PostgreSQL database running, add its connection URL as `DATABASE_URL` in Render

---

## After Setting DATABASE_URL

1. Render will automatically redeploy your backend
2. Prisma will connect to the database on startup
3. Frontend API calls to `/api/products` should now return 200 instead of 500
4. You may need to seed the database with initial data (categories, test products, etc.)

---

## Verify Connection

After redeploy, check:
```bash
curl https://georgy-marketplace-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...,
  "environment": "production"
}
```

Then check products endpoint:
```bash
curl https://georgy-marketplace-backend.onrender.com/api/products
```

Should return JSON with product data (not 500 error).
