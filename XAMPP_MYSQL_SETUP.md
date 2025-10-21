# XAMPP MySQL Setup for Georgy Marketplace

## 🎯 Overview

The Georgy Marketplace now uses **MySQL with XAMPP** for both development and production. This provides a production-grade database that works locally and can be easily deployed.

## 📋 Prerequisites

- ✅ **XAMPP installed** (you mentioned you have this)
- ✅ **MySQL/MariaDB** included in XAMPP
- ✅ **Port 3306** available (default MySQL port)

## 🚀 Quick Start Guide

### 1. Start XAMPP Services

1. **Open XAMPP Control Panel**
2. **Start Apache** (optional, for phpMyAdmin)
3. **Start MySQL** ⭐ (required)

### 2. Verify MySQL is Running

Check that MySQL is running on port 3306:
- XAMPP Control Panel should show MySQL as "Running"
- Green indicator next to MySQL service

### 3. Create Database

**Option A: Using phpMyAdmin (Recommended)**
1. Open `http://localhost/phpmyadmin/`
2. Click "New" on the left sidebar
3. Create database: `georgy_marketplace`
4. Choose UTF8 collation: `utf8mb4_unicode_ci`

**Option B: Using MySQL Command Line**
```sql
CREATE DATABASE georgy_marketplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Initialize Application Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to MySQL (creates all tables)
npm run db:push

# Seed with sample data
npx tsx prisma/seed.ts

# Start development server
npm run dev:mysql
```

### 5. Verify Setup

- **URL**: `http://localhost:5173`
- **Console Message**: "🗄️ Running in Prisma MySQL mode."
- **Database**: `georgy_marketplace` on MySQL port 3306

## 🛠️ Available Commands

### Development & Production
```bash
npm run dev:mysql          # Development with MySQL
npm run build:mysql        # Production build  
npm run preview:mysql      # Preview production
```

### Database Management
```bash
npm run db:generate         # Generate Prisma client
npm run db:push            # Apply schema changes
npm run db:migrate         # Create migrations (recommended)
npm run db:studio          # Visual database editor
npm run db:reset           # Reset database (⚠️ destructive)
```

### Database Tools
```bash
# Open phpMyAdmin
# http://localhost/phpmyadmin/

# Open Prisma Studio
npm run db:studio
# http://localhost:5555
```

## 📊 Database Configuration

### Current Settings
```
Host: localhost
Port: 3306
User: root
Password: (empty/none)
Database: georgy_marketplace
```

### Connection String
```
DATABASE_URL="mysql://root@localhost:3306/georgy_marketplace"
```

## 🔧 Troubleshooting

### "Can't reach database server"
```
Error: P1001: Can't reach database server at `localhost:3306`
```

**Solutions:**
1. ✅ **Start XAMPP MySQL** service
2. ✅ **Check port 3306** is not blocked
3. ✅ **Verify XAMPP** is using port 3306 (not 3307)

### "Database doesn't exist"
```
Error: P1003: Database georgy_marketplace does not exist
```

**Solutions:**
1. Create database in phpMyAdmin: `georgy_marketplace`
2. Or run: `CREATE DATABASE georgy_marketplace;`

### "Access denied for user 'root'"
```
Error: P1045: Access denied for user 'root'@'localhost'
```

**Solutions:**
1. Update connection string with password:
   ```
   DATABASE_URL="mysql://root:your_password@localhost:3306/georgy_marketplace"
   ```
2. Reset MySQL root password in XAMPP

### "Table doesn't exist"
```
Error: P2021: Table `georgy_marketplace.User` doesn't exist
```

**Solutions:**
```bash
# Push schema to create tables
npm run db:push

# Or run migrations
npm run db:migrate
```

## 🗄️ Database Schema

### Core Tables Created
- **users** - Customer, seller, admin accounts
- **categories** - Product categories with hierarchy  
- **listings** - Main marketplace products
- **listing_images** - Product photos
- **seller_profiles** - Business information
- **orders** & **order_items** - E-commerce transactions
- **payments** - Payment processing
- **reviews** - Product ratings
- **inventory** - Stock management
- **conversations** & **messages** - Customer communication

### Extended Features
- **artisan_profiles** - Service provider profiles
- **service_requests** - Artisan marketplace
- **property_listings** - Real estate module
- **job_postings** - Job matching platform

## 🌱 Sample Data

After seeding, you'll have:
- **5 Categories**: Electronics, Fashion, Home & Garden, Vehicles, Services
- **Demo User**: `demo@georgy.com` (seller account)
- **3 Sample Listings**: iPhone (₦450,000), Gaming Laptop (₦680,000), Toyota Camry (₦8,500,000)
- **Seller Profile**: "John's Electronics Store"

## 🔄 Development Workflow

### Daily Development
1. **Start XAMPP** → Start MySQL service
2. **Run application**: `npm run dev:mysql`
3. **Make changes** to schema in `prisma/schema.prisma`
4. **Apply changes**: `npm run db:push`
5. **View data**: `npm run db:studio` or phpMyAdmin

### Schema Changes
1. **Edit** `prisma/schema.prisma`
2. **Create migration**: `npm run db:migrate`
3. **Review migration** files in `prisma/migrations/`
4. **Apply to production** with same migration commands

## 🚀 Production Deployment

### 1. Production MySQL Setup
- Install MySQL Server on production server
- Create production database
- Update connection string for production

### 2. Environment Variables
```bash
# Production environment
NODE_ENV=production
VITE_DEV_MODE=false
VITE_USE_PRISMA=true
DATABASE_URL="mysql://username:password@prod_host:3306/georgy_marketplace_prod"
```

### 3. Deployment Steps
```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run db:generate

# 3. Run migrations (production)
npx prisma migrate deploy

# 4. Seed production data (optional)
npx tsx prisma/seed.ts

# 5. Build application
npm run build:mysql
```

## 🎯 Benefits of MySQL + XAMPP

### Development Benefits
- ✅ **Same as Production** - Identical database technology
- ✅ **Visual Tools** - phpMyAdmin + Prisma Studio
- ✅ **No Cloud Dependency** - Works offline
- ✅ **Easy Reset** - Quick database reset/reseed
- ✅ **SQL Learning** - Direct SQL access for learning

### Production Benefits  
- ✅ **Industry Standard** - MySQL is widely used
- ✅ **Scalable** - Handles large applications
- ✅ **Reliable** - Proven in production
- ✅ **Portable** - Easy to migrate between hosts
- ✅ **Cost Effective** - Many hosting options

### Technical Benefits
- ✅ **ACID Compliance** - Data integrity guaranteed
- ✅ **Transactions** - Safe multi-operation commits
- ✅ **Indexing** - Fast query performance
- ✅ **Relationships** - Foreign keys and joins
- ✅ **Migrations** - Version-controlled schema changes

## 📚 Next Steps

1. **Start XAMPP** and ensure MySQL is running
2. **Create database** `georgy_marketplace` in phpMyAdmin
3. **Run setup commands**:
   ```bash
   npm run db:push
   npx tsx prisma/seed.ts
   npm run dev:mysql
   ```
4. **Explore your database** in phpMyAdmin or Prisma Studio
5. **Start building** your marketplace features!

**Your Georgy Marketplace now has enterprise-grade MySQL database capabilities! 🎉**
