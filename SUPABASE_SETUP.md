# Supabase Setup Guide for Neural Nexus Health App

## Your Supabase Credentials

- **Project URL**: `https://lfzqgrlhmmpxqtzaayyc.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmenFncmxobW1weHF0emFheXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTk5OTIsImV4cCI6MjA5Mjg3NTk5Mn0.5V_YdwK1nEHxfzwJVlAfAvEEqXIq5vzcLWr_dYhUosc`

## What You Need to Do in Supabase Dashboard

### 1. Enable Email Authentication (Magic Link)

1. Go to your [Supabase Dashboard](https://lfzqgrlhmmpxqtzaayyc.supabase.co)
2. Navigate to **Authentication** → **Providers**
3. Find **Email** provider and enable it
4. Configure settings:
   - **Confirm email** - OFF
   - **Secure email change** - ON
   - **Enable magic link** - ON (passwordless login)

### 2. Run the Database Setup

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **Run**

This creates:
- `profiles` table (stores user role & email)
- Auto-trigger to create profile on signup

### 3. Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the **Magic Link** template if needed
3. Default template contains clickable login link

### 4. Configure Authentication Settings

1. Go to **Authentication** → **Settings**
2. Under **JWT Settings**, keep default expiry
3. Under **External OAuth Providers**, disable all (using Magic Link only)

### 5. Update Site URL (Important for Production)

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain (e.g., `https://yourdomain.com`)
3. Add any redirect URLs you'll use

## How Magic Link Login Works

1. User selects role (Community Member / Health Officer / Local Leader)
2. User enters email address
3. Click "Send Magic Link"
4. Supabase sends email with magic link
5. User clicks the link in their email
6. User is automatically logged in and redirected to dashboard
7. User profile is created with their role
8. Session is persisted for automatic login

## Environment Variables (for local development)

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lfzqgrlhmmpxqtzaayyc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmenFncmxobW1weHF0emFheXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTk5OTIsImV4cCI6MjA5Mjg3NTk5Mn0.5V_YdwK1nEHxfzwJVlAfAvEEqXIq5vzcLWr_dYhUosc
```

## Testing the Magic Link Flow

### Development Mode

1. Use any valid email address
2. Check Supabase Dashboard → **Logs** → **Auth** for sent emails
3. Or check your actual email inbox

### With Real Email

The app will send actual magic link emails to real email addresses once configured.

## Files Created/Modified

- `lib/supabase.ts` - Supabase client configuration
- `lib/supabase-server.ts` - Server-side Supabase client
- `middleware.ts` - Route protection and auth redirects
- `hooks/useAuth.ts` - React hook for auth state
- `app/login/page.tsx` - Updated with magic link flow
- `app/dashboard/page.tsx` - Updated with auth check and logout
- `app/layout.tsx` - Added Toaster for notifications

## Protected Routes

The following routes require authentication (configured in `middleware.ts`):
- `/dashboard`
- `/alerts`
- `/report`
- `/map`
- `/learn`

Unauthenticated users are redirected to `/login`.
