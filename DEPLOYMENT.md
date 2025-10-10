# Vercel Deployment Guide

This guide will walk you through deploying your Adventure Rentals platform to Vercel for production.

## Prerequisites

- [ ] GitHub account
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Supabase project with schema deployed
- [ ] At least one admin user created in your database

## Step 1: Prepare Your Repository

### 1.1 Create a GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Adventure Rentals MVP"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/bike_rental.git
git branch -M main
git push -u origin main
```

### 1.2 Verify .gitignore

Make sure your `.gitignore` includes:
```
.env.local
.env*.local
.vercel
node_modules/
.next/
```

## Step 2: Configure Supabase for Production

### 2.1 Supabase Project Settings

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Note down:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

### 2.2 Configure Authentication

1. Go to **Authentication** → **URL Configuration**
2. Add your Vercel domain to **Site URL** (you'll update this after deployment)
3. Add redirect URLs:
   - `https://your-domain.vercel.app/auth/callback`
   - `http://localhost:3001/auth/callback` (for local dev)

### 2.3 Email Templates (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Customize:
   - Confirm signup template
   - Reset password template
   - Magic link template
3. Add your branding and company info

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub to Vercel

1. Go to https://vercel.com/new
2. Click **Import Project**
3. Select **Import Git Repository**
4. Choose your `bike_rental` repository
5. Click **Import**

### 3.2 Configure Build Settings

Vercel should auto-detect Next.js. Verify:

- **Framework Preset**: Next.js
- **Build Command**: `yarn build` (or leave default)
- **Output Directory**: `.next`
- **Install Command**: `yarn install` (or leave default)

### 3.3 Add Environment Variables

Click **Environment Variables** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |

**Important**: Make sure to select all three environments (Production, Preview, Development).

### 3.4 Deploy

1. Click **Deploy**
2. Wait for build to complete (usually 1-2 minutes)
3. Vercel will provide a deployment URL (e.g., `your-project.vercel.app`)

## Step 4: Post-Deployment Configuration

### 4.1 Update Supabase URLs

1. Go back to Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Update **Site URL** to your Vercel URL: `https://your-project.vercel.app`
4. Add to **Redirect URLs**:
   ```
   https://your-project.vercel.app/*
   https://your-project.vercel.app/auth/callback
   ```

### 4.2 Test Your Deployment

1. Visit `https://your-project.vercel.app`
2. Test user signup and login
3. Test admin access at `/admin`
4. Create a test vehicle
5. Create a test rental

### 4.3 Custom Domain (Optional)

If you have a custom domain:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs with your custom domain

## Step 5: Create Your Admin Account in Production

### Method 1: Via Web Interface (Recommended for MVP)

1. Visit your Vercel deployment URL
2. Click **Sign Up**
3. Create your account with the email you want as admin
4. Go to Supabase Dashboard → **Table Editor** → `profiles`
5. Find your user and change `role` to `admin`
6. Sign out and sign back in

### Method 2: Via SQL

In Supabase SQL Editor:

```sql
-- Replace with your email
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

## Step 6: MVP Presentation Checklist

### Essential Pre-Demo Tasks

- [ ] **Add Demo Vehicles**: Create 3-5 appealing motorcycles/UTVs with good descriptions
- [ ] **Test Rental Flow**: Book a rental as regular user, approve as admin
- [ ] **Test Admin Features**: 
  - [ ] Vehicle creation/editing
  - [ ] Rental approval workflow
  - [ ] Customer management
- [ ] **Mobile Testing**: Test on phone/tablet
- [ ] **Clear Test Data**: Remove any obvious test entries

### Demo Script Preparation

**1. Homepage** (30 seconds)
- "Welcome to Adventure Rentals - our platform for renting motorcycles and UTVs"
- Show hero section, featured vehicles
- Highlight "Browse Rentals" call-to-action

**2. Browse & Book** (1 minute)
- Show vehicle listings with filters
- Click into a vehicle detail page
- Show booking form (don't submit unless you want to demo approval)

**3. User Authentication** (30 seconds)
- Show signup/login flow
- "Users can create accounts to manage their rentals"

**4. Admin Dashboard** (2 minutes)
- Sign in as admin
- **Dashboard**: "Here's our admin command center with real-time stats"
- **Vehicles**: "Admins can add, edit, and manage the entire fleet"
  - Show vehicle creation
  - Toggle availability
- **Rentals**: "Complete rental management system"
  - Show status workflow (pending → confirmed → active → completed)
  - Demonstrate approval/rejection
  - Show admin notes feature
- **Customers**: "Customer management with rental history and role management"

**5. Technical Highlights** (30 seconds)
- "Built with Next.js 15 for optimal performance"
- "Supabase backend with row-level security"
- "Role-based access control with middleware protection"
- "Responsive design works perfectly on all devices"

### Visual Polish Recommendations

Before your demo:

1. **Add Real Content**:
   - Use professional-sounding vehicle descriptions
   - Set realistic prices
   - Add specifications that make sense

2. **Screenshots**: Take screenshots of key screens for backup slides

3. **Test Scenarios**: Prepare 2-3 rental scenarios to demonstrate

## Step 7: Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update vehicle descriptions"
git push

# Vercel automatically rebuilds and deploys
```

## Troubleshooting

### Build Fails on Vercel

**Check build logs** in Vercel dashboard. Common issues:
- TypeScript errors (fix locally first)
- Missing environment variables
- Dependency issues

**Solution**: 
```bash
# Test production build locally
yarn build

# If it fails, fix errors before pushing
```

### Authentication Not Working

**Symptoms**: Users can't sign up/login

**Solutions**:
1. Verify environment variables in Vercel
2. Check Supabase redirect URLs include your Vercel domain
3. Check Supabase project is not paused
4. Verify API keys are correct

### Admin Access Denied

**Symptoms**: Can't access /admin even after setting role

**Solutions**:
1. Verify `role` column in `profiles` table is set to `admin`
2. Sign out completely and sign back in
3. Check middleware is deployed (should be automatic)
4. Clear browser cookies/cache

### Page Not Found Errors

**Symptoms**: 404 errors on certain pages

**Solutions**:
1. Ensure all pages are committed to GitHub
2. Check Vercel build logs for errors
3. Verify file paths are correct (case-sensitive)

## Performance Optimization (Post-MVP)

After your demo, consider:

1. **Image Optimization**: Add next/image for vehicle photos
2. **Caching**: Configure Vercel edge caching
3. **Analytics**: Add Vercel Analytics
4. **Monitoring**: Set up Sentry for error tracking
5. **Database**: Add Supabase indexes for frequently queried data

## Security Checklist

Before going fully live:

- [ ] Enable email confirmation in Supabase
- [ ] Set up rate limiting
- [ ] Review RLS policies
- [ ] Enable 2FA for admin accounts
- [ ] Set up database backups in Supabase
- [ ] Configure CORS properly
- [ ] Add security headers in next.config.js

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Deployment Issues**: Check Vercel build logs and Supabase logs

---

## Quick Reference: Environment Variables

Production environment variables needed:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

Add these in:
- Vercel Dashboard → Project Settings → Environment Variables
- Select all environments (Production, Preview, Development)

---

**Good luck with your MVP presentation! 🚀**
