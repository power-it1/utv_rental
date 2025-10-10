# Admin Account Setup Guide

This guide will walk you through setting up your first admin account and accessing the admin panel.

## Prerequisites

Before you start, make sure you have:
- A Supabase project created
- Environment variables configured in `.env.local`

## Step 1: Configure Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase Dashboard:
- Go to **Settings** → **API**
- Copy the **Project URL** and **anon public** key

## Step 2: Run Database Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `supabase/schema.sql`
5. Click **Run** to execute the schema

This will create:
- User roles (user/admin enum)
- Tables: profiles, vehicles, rentals, gps_tracking, activity_logs
- Row Level Security (RLS) policies
- Necessary indexes

## Step 3: Sign Up for an Account

### Option A: Via Web Interface

1. Start your development server:
   ```bash
   yarn dev
   ```

2. Open your browser to http://localhost:3001

3. Click **Sign Up** in the header

4. Fill out the registration form:
   - Email address
   - Password (minimum 6 characters)
   - Full Name
   - Phone Number (optional)

5. Click **Sign Up**

6. Check your email for a confirmation link (if email confirmation is enabled in Supabase)

### Option B: Via Supabase Dashboard

1. Go to **Authentication** → **Users** in Supabase
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Click **Create user**

## Step 4: Promote User to Admin

After creating your account, you need to manually set the admin role in the database.

### Option A: Via Supabase Table Editor (Easiest)

1. Go to **Table Editor** in Supabase
2. Select the **profiles** table
3. Find your user row (by email or name)
4. Click on the row to edit
5. Change the **role** field from `user` to `admin`
6. Click **Save**

### Option B: Via SQL Editor

1. Go to **SQL Editor** in Supabase
2. Run this query (replace with your email):

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

3. Click **Run**

### Option C: Create Admin Directly (For First Admin)

If you haven't signed up yet, you can create an admin account directly:

```sql
-- First, create the auth user (do this in Supabase Dashboard or via signup)
-- Then run this to ensure the profile has admin role:

-- If profile already exists, update it:
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- If profile doesn't exist yet, it will be created automatically on first login
-- due to the trigger in schema.sql
```

## Step 5: Sign In and Access Admin Panel

1. Go to http://localhost:3001

2. Click **Sign In** in the header

3. Enter your email and password

4. Click **Sign In**

5. Once logged in, you should see:
   - **My Rentals** link in the header (for all authenticated users)
   - **Admin** link in the header (only for admin users)

6. Click **Admin** to access the admin dashboard

## Admin Panel Features

Once you're in the admin panel, you'll have access to:

### 📊 Dashboard
- View statistics (revenue, rentals, customers)
- See recent activity
- Quick action buttons

### 🏍️ Vehicles
- View all vehicles (motorcycles, UTVs, guided tours)
- Add new vehicles
- Edit existing vehicles
- Toggle availability
- Delete vehicles

### 📋 Rentals
- View all rental requests
- Filter by status (pending, confirmed, active, completed, cancelled)
- Approve or reject pending requests
- Start rentals (mark as active)
- Complete active rentals
- Add admin notes to rentals

### 👥 Customers
- View all registered users
- See customer statistics (rental count, total spent)
- Promote users to admin or demote admins
- Search customers

### 📍 GPS Tracking
- *Coming Soon: Real-time GPS tracking of active rentals*

### 📝 Activity Logs
- *Coming Soon: Audit trail of all admin actions*

## Troubleshooting

### "Access Denied" when visiting /admin

**Cause**: Your user account doesn't have the admin role set.

**Solution**: 
1. Double-check the `profiles` table in Supabase
2. Verify your user's `role` column is set to `admin`
3. Sign out and sign in again to refresh the session

### Can't see admin link in header after signing in

**Cause**: Middleware or session not recognizing admin role.

**Solution**:
1. Check browser console for errors
2. Sign out completely
3. Clear browser cookies/cache
4. Sign in again
5. If still not working, check that `schema.sql` was run completely

### Email confirmation required

**Cause**: Supabase has email confirmation enabled by default.

**Options**:
1. Check your email for confirmation link
2. OR disable email confirmation in Supabase:
   - Go to **Authentication** → **Providers** → **Email**
   - Toggle **Confirm email** to OFF
   - Sign up again

### Database schema errors

**Cause**: Schema might not have been applied correctly.

**Solution**:
1. Go to **SQL Editor**
2. Re-run the entire `schema.sql` file
3. Check for any error messages in the results panel

## Next Steps

After setting up your admin account:

1. **Add Vehicles**: Go to **Admin → Vehicles → Add New Vehicle**
   - Add some motorcycles, UTVs, or guided tours
   - Set prices and descriptions
   - Add specifications (engine size, seats, etc.)

2. **Test Rentals**: 
   - Create a second regular user account
   - Book a rental as that user
   - Approve it as admin
   - Test the rental workflow (confirm → active → complete)

3. **Explore Features**:
   - Try filtering vehicles and rentals
   - Add admin notes to rentals
   - Promote/demote user roles

4. **Production Prep** (when ready):
   - Set up proper email templates in Supabase
   - Configure production environment variables
   - Enable RLS policies review
   - Set up backup schedules
   - Consider rate limiting
   - Add monitoring/logging (Sentry, etc.)

## Security Notes

⚠️ **Important Security Reminders**:

- Never commit `.env.local` to version control
- Use strong passwords for admin accounts
- Regularly review admin user list
- Monitor activity logs (once implemented)
- In production, enable email confirmation
- Set up 2FA in Supabase for admin emails
- Use Supabase's built-in rate limiting
- Regularly update dependencies

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs (Logs & Reports section)
3. Review RLS policies in Table Editor
4. Verify middleware is working (check Network tab)

---

**Happy Renting! 🏍️🚙**
