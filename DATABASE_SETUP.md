# Database Setup Instructions

## Development Mode (Recommended for Testing)

The application is currently configured to run in **development mode** with mock data. This allows you to test the UI without setting up a database.

### Current Configuration

The application will automatically use mock data when `VITE_DEV_MODE=true` in your `.env` file.

## Production Database Setup (Supabase)

To connect to a real Supabase database:

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the entire content from `docs/database-schema.sql`
3. Run the script to create all tables and relationships

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Update the variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here

# Set to false to use real database
VITE_DEV_MODE=false
```

### 4. Enable Row Level Security (RLS)

The database schema includes RLS policies. Make sure they are enabled in your Supabase project:

1. Go to Authentication > Policies
2. Enable RLS on all tables
3. The policies are already defined in the schema

### 5. Set Up Storage

For image uploads, configure Supabase Storage:

1. Go to Storage in your Supabase dashboard
2. Create buckets for:
   - `listing-images`
   - `profile-avatars` 
   - `documents`
3. Set appropriate policies for public read access

## Database Tables

The schema includes the following main tables:

- `profiles` - User profiles (extends Supabase auth)
- `categories` - Product/service categories
- `listings` - Product/service listings
- `listing_images` - Product images
- `orders` - Order management
- `messages` - Communication system
- `reviews` - Rating and review system
- `properties` - Real estate listings
- `jobs` - Job postings
- `legal_documents` - Legal framework
- `disputes` - Dispute resolution

## Switching Modes

### To Development Mode (Mock Data)
Set `VITE_DEV_MODE=true` in `.env`

### To Production Mode (Real Database)
1. Complete the Supabase setup above
2. Set `VITE_DEV_MODE=false` in `.env`
3. Restart the development server

## Troubleshooting

### Common Issues

1. **404 Errors**: Tables don't exist - run the database schema
2. **400 Bad Request**: Foreign key relationships missing - check schema execution
3. **Authentication Errors**: Invalid API key - verify your Supabase credentials

### Verification Steps

1. Check Supabase dashboard for created tables
2. Verify RLS policies are enabled
3. Test API key in Supabase API docs
4. Check browser network tab for specific error details

## Sample Data

In development mode, the application includes:
- 8 sample categories
- 5 sample products with different conditions and prices
- Sample users with verification status
- Mock images (placeholder URLs)

This allows full UI testing without database setup.
