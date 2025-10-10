# 🚀 Quick Deploy to Vercel - 15 Minutes

This is your express guide to get Adventure Rentals live on Vercel for your MVP presentation.

## ⏱️ Time Estimate: 15 minutes total

## Step 1: Supabase Setup (5 minutes)

### 1.1 Create Project
1. Go to https://supabase.com
2. Click **New Project**
3. Name it: `adventure-rentals`
4. Set a database password (save it!)
5. Wait 2 minutes for project to provision

### 1.2 Run Schema
1. Click **SQL Editor** in sidebar
2. Click **New Query**
3. Copy entire `supabase/schema.sql` from this repo
4. Paste and click **Run**
5. Should see "Success. No rows returned"

### 1.3 Get API Keys
1. Click **Settings** (gear icon) → **API**
2. Copy **Project URL** (e.g., `https://xxxxx.supabase.co`)
3. Copy **anon public** key (starts with `eyJhbGc...`)
4. Save these somewhere - you'll need them in 2 minutes

---

## Step 2: GitHub Push (2 minutes)

```bash
# In your project directory
git init
git add .
git commit -m "Ready for MVP deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/bike_rental.git
git branch -M main
git push -u origin main
```

---

## Step 3: Vercel Deploy (3 minutes)

### 3.1 Import Project
1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your `bike_rental` repo
4. Click **Import**

### 3.2 Add Environment Variables
**Before clicking Deploy**, add these:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

**Important**: Select **All** (Production, Preview, Development)

### 3.3 Deploy
1. Click **Deploy**
2. Wait 1-2 minutes
3. Copy your deployment URL (e.g., `https://bike-rental-xxxx.vercel.app`)

---

## Step 4: Connect Supabase to Vercel (2 minutes)

### Back in Supabase Dashboard:
1. Go to **Authentication** → **URL Configuration**
2. **Site URL**: Paste your Vercel URL
3. **Redirect URLs**: Add these (replace with your actual URL):
   ```
   https://your-vercel-app.vercel.app/*
   https://your-vercel-app.vercel.app/auth/callback
   ```
4. Click **Save**

---

## Step 5: Create Admin Account (3 minutes)

### 5.1 Sign Up
1. Visit your Vercel URL
2. Click **Sign Up**
3. Enter your email and password
4. Fill in your name

### 5.2 Make Yourself Admin
1. Back to Supabase Dashboard
2. Click **Table Editor** → Select `profiles` table
3. Find your new user (look for your name/email)
4. Click the row to edit
5. Change `role` from `user` to `admin`
6. Click **Save** (checkmark)

### 5.3 Test Admin Access
1. Go back to your site
2. Sign out
3. Sign in again
4. You should now see **Admin** link in header
5. Click it - you're in! 🎉

---

## Step 6: Add Demo Content (Optional - 10 minutes)

Before your demo, add 3-5 vehicles:

1. Click **Admin** → **Vehicles** → **Add New Vehicle**

### Example Motorcycle:
- **Type**: Motorcycle
- **Name**: "Harley-Davidson Road Glide"
- **Description**: "Experience the open road on this iconic touring motorcycle. Features comfortable seating, advanced audio system, and perfect for long-distance adventures. Smooth power delivery and classic American styling."
- **Price**: $250/day
- **Specifications**: 
  - `engine`: "Milwaukee-Eight 114"
  - `seats`: "2"
  - `type`: "Touring"
- **Available**: ✅ Checked

### Example UTV:
- **Type**: UTV
- **Name**: "Polaris RZR XP 1000"
- **Description**: "Dominate the trails with this high-performance side-by-side. 110HP engine, FOX suspension, and room for 2. Perfect for off-road adventures and exploring challenging terrain."
- **Price**: $350/day
- **Specifications**:
  - `engine`: "110HP ProStar"
  - `seats`: "2"
  - `drivetrain`: "4WD"
  - `suspension`: "FOX 2.5 Podium"
- **Available**: ✅ Checked

Repeat for 3-5 total vehicles to make your demo look professional!

---

## ✅ You're Live!

Your site is now:
- 🌐 Live on the internet
- 🔒 Secure with authentication
- 👑 Admin panel accessible
- 📱 Mobile responsive
- ⚡ Fast and production-ready

---

## 🎬 Demo Preparation

### Quick test before presenting:
1. ✅ Homepage loads
2. ✅ Can browse vehicles
3. ✅ Admin panel accessible
4. ✅ Can create/edit a vehicle
5. ✅ Site works on mobile (test on phone)

### During Demo:
1. **Homepage** - "Here's our Adventure Rentals platform"
2. **Browse** - "Customers can filter by vehicle type"
3. **Admin** - "Complete management dashboard"
4. **Create Vehicle** - "Easy vehicle management"
5. **Rentals** - "Full booking approval workflow"

---

## 🆘 Emergency Troubleshooting

**Can't login**: 
- Check Supabase redirect URLs match your Vercel domain exactly

**Admin link not showing**:
- Verify `role` column is `admin` in Supabase
- Sign out and sign in again

**Build failed on Vercel**:
- Check environment variables are set
- Look at build logs in Vercel dashboard

**Site is slow**:
- This is normal on first load (cold start)
- After first visit, it should be fast

---

## 📞 Support

If stuck, check:
1. Vercel deployment logs
2. Browser console (F12)
3. Supabase logs (Database → Logs)

---

**You're ready to impress your partner! 🚀**

**Deployment URL**: `_______________________`
**Admin Email**: `_______________________`
**Admin Password**: `_______________________`

(Fill these in and keep them handy for your demo!)
