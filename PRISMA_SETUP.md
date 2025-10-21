# Prisma SQLite Production Setup

## 🎯 Overview

The Georgy Marketplace now supports **Prisma with SQLite** as a production database option. This provides a real, persistent database with migrations, type safety, and better performance than the in-memory mock database.

## 🚀 Quick Start

### 1. Start Prisma Production Mode

```bash
# Development server with Prisma SQLite
npm run dev:prisma

# Production build with Prisma
npm run build:prisma

# Preview production build
npm run preview:prisma
```

### 2. Access Your Application

- **URL**: `http://localhost:5173`
- **Console Message**: "🗄️ Running in Prisma SQLite mode."
- **Database**: `./dev.db` (SQLite file)

## 📋 Available Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (⚠️ destructive)
npm run db:reset
```

## 🗄️ Database Schema

### Core Tables

- **Users** - Customer, seller, admin accounts
- **Categories** - Product categories with hierarchy
- **Listings** - Main marketplace products
- **ListingImages** - Product photos
- **SellerProfiles** - Business information
- **Orders & OrderItems** - E-commerce transactions
- **Payments** - Payment processing
- **Reviews** - Product ratings
- **InventoryItems** - Stock management
- **Conversations & Messages** - Customer communication

### Extended Features

- **ArtisanProfiles** - Service provider profiles
- **ServiceRequests** - Artisan service marketplace
- **PropertyListings** - Real estate module
- **JobPostings** - Job matching platform

## 🔧 Configuration

### Environment Variables

**Option 1: Prisma SQLite (Recommended for Production)**
```env
VITE_DEV_MODE=false
VITE_USE_PRISMA=true
DATABASE_URL="file:./dev.db"
```

**Option 2: Development Mode**
```env
VITE_DEV_MODE=true
```

**Option 3: Demo Production**
```env
VITE_DEV_MODE=false
VITE_DEMO_PRODUCTION=true
```

**Option 4: Supabase Production**
```env
VITE_DEV_MODE=false
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## 🌱 Sample Data

The database comes pre-seeded with:

- **5 Categories**: Electronics, Fashion, Home & Garden, Vehicles, Services
- **Demo User**: `demo@georgy.com` (seller account)
- **3 Sample Listings**: iPhone, Gaming Laptop, Toyota Camry
- **Seller Profile**: "John's Electronics Store"

## 📊 Database Management

### Prisma Studio

```bash
npm run db:studio
```

Access the visual database editor at `http://localhost:5555`

### Schema Changes

1. **Edit** `prisma/schema.prisma`
2. **Push changes**: `npm run db:push`
3. **Generate client**: `npm run db:generate`

### Migrations (Recommended for Production)

```bash
# Create and apply migration
npm run db:migrate

# Reset database (development only)
npm run db:reset
```

## 🔍 Testing & Validation

### 1. Verify Database Connection

Check browser console for: `"🗄️ Running in Prisma SQLite mode."`

### 2. Test Core Features

- ✅ **Homepage**: Shows 3 sample listings
- ✅ **Categories**: 5 categories display correctly
- ✅ **Seller Dashboard**: Real analytics from database
- ✅ **Product Creation**: New listings persist to SQLite
- ✅ **Authentication**: Demo login works
- ✅ **Search**: Find products across categories

### 3. Database File

Verify `dev.db` exists in your project root with data.

## 🏗️ Production Deployment

### 1. Database File

- **Development**: `./dev.db`
- **Production**: Update `DATABASE_URL` to production path
- **Backup**: SQLite file is portable and easy to backup

### 2. Environment Setup

```bash
# Production environment
NODE_ENV=production
VITE_DEV_MODE=false
VITE_USE_PRISMA=true
DATABASE_URL="file:./production.db"
```

### 3. Deployment Steps

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run db:generate

# 3. Run migrations
npm run db:migrate

# 4. Seed database (optional)
npx tsx prisma/seed.ts

# 5. Build application
npm run build:prisma

# 6. Start production server
npm run preview:prisma
```

## 🔄 Mode Comparison

| Mode | Database | Use Case | Data Persistence |
|------|----------|----------|------------------|
| **Development** | In-memory | Local dev | ❌ No |
| **Demo Production** | In-memory | Testing | ❌ No |
| **Prisma SQLite** | SQLite file | Production | ✅ Yes |
| **Supabase** | PostgreSQL | Cloud production | ✅ Yes |

## 🛠️ Troubleshooting

### Common Issues

1. **"Cannot find module @prisma/client"**
   ```bash
   npm run db:generate
   ```

2. **"Database does not exist"**
   ```bash
   npm run db:push
   ```

3. **"Prisma client is outdated"**
   ```bash
   npm run db:generate
   ```

4. **Reset everything**
   ```bash
   npm run db:reset
   npx tsx prisma/seed.ts
   ```

### File Locations

- **Schema**: `prisma/schema.prisma`
- **Database**: `./dev.db`
- **Prisma Client**: `src/lib/prisma.ts`
- **Service**: `src/services/prismaService.ts`
- **Seed Script**: `prisma/seed.ts`

## 🎉 Benefits of Prisma SQLite

- ✅ **Real Database** - Persistent data storage
- ✅ **Type Safety** - Generated TypeScript types
- ✅ **Migrations** - Version-controlled schema changes
- ✅ **Zero Config** - No external database setup required
- ✅ **Portable** - Single file database
- ✅ **Performance** - Native SQLite speed
- ✅ **SQL Queries** - Full SQL support
- ✅ **Studio GUI** - Visual database management
- ✅ **Production Ready** - Suitable for production use

**Your Georgy Marketplace now has a production-grade database! 🚀**
