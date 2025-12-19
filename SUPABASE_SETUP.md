# Supabase Migration - Setup Instructions

## 🚀 Quick Start

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Login
3. Click "New Project"
4. Fill in project details (choose free tier)
5. Wait for project to be created (~2 minutes)

### 2. Setup Database Table
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase-setup.sql`
4. Click "Run" to execute the SQL

### 3. Create Storage Bucket
1. In your Supabase dashboard, go to **Storage**
2. Click "New Bucket"
3. Bucket name: `penduduk-photos`
4. **Make it PUBLIC** ✅
5. Click "Create Bucket"
6. Click on the bucket, then "Policies"
7. Add policy for public access:
   - Policy name: "Public Access"
   - Target roles: `public`
   - Allowed operations: SELECT, INSERT
   - Click "Save"

### 4. Get API Credentials
1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

### 5. Configure Environment Variables
1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Edit `.env.local` and paste your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

### 6. Run the Application
```bash
npm run dev
```

Visit `http://localhost:3000` and test the application!

## 📝 What Changed?

- ✅ Database: Vercel Blob JSON → Supabase PostgreSQL
- ✅ Image Storage: Vercel Blob → Supabase Storage
- ✅ All API endpoints updated to use Supabase
- ✅ No changes to UI or functionality

## 🔧 Deployment to Vercel

1. Push your code to GitHub
2. In Vercel dashboard, go to your project settings
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Redeploy your application

## ⚠️ Important Notes

- The `SUPABASE_SERVICE_ROLE_KEY` should be kept secret
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Supabase free tier includes:
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users
