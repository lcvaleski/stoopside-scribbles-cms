noma# Simple RLS Setup for Google OAuth

## Overview
Since you're using Google OAuth with a predefined list of authorized emails (configured in your AUTHORIZED_EMAILS environment variable), this guide provides a simple RLS setup that mirrors your existing authentication approach.

## Quick Setup

### Step 1: Backup Your Data
Before applying RLS:
1. Go to Supabase Dashboard → Settings → Database → Backups
2. Create a new backup

### Step 2: Update the Authorized Emails
Edit `supabase-rls-simple.sql` and modify the `is_authorized_email` function to include your authorized emails (lines 12-18). These should match the emails in your `AUTHORIZED_EMAILS` environment variable.

### Step 3: Apply RLS Policies
1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire contents of `supabase-rls-simple.sql`
3. Paste and click "Run"

## How It Works

### Authentication Flow
1. User signs in with Google OAuth (handled by NextAuth)
2. NextAuth checks if the email is in your AUTHORIZED_EMAILS env variable
3. If authorized, user gets a JWT token with their email
4. Supabase RLS policies check if the JWT email matches the authorized list
5. Access is granted/denied based on the email match

### Two Options for Managing Emails

#### Option 1: Hardcoded in Function (Simpler)
- Emails are defined in the `is_authorized_email` function
- To add/remove users, update the function and re-run the SQL
- Best for small, rarely-changing user lists

#### Option 2: Database Table (More Flexible)
- Use the `authorized_emails` table
- Add emails via SQL:
  ```sql
  INSERT INTO authorized_emails (email) VALUES ('new-user@gmail.com');
  ```
- No need to modify functions when adding/removing users

## Testing RLS

### Test Your Access
```sql
-- In Supabase SQL Editor, test as authenticated user
SET ROLE authenticated;
SET request.jwt.claim.email = 'elliemgoetz@gmail.com';

-- Should return results
SELECT * FROM posts;
```

### Test Unauthorized Access
```sql
-- Test as anonymous user
SET ROLE anon;

-- Should return no results
SELECT * FROM posts;
```

### Test with Wrong Email
```sql
SET ROLE authenticated;
SET request.jwt.claim.email = 'unauthorized@gmail.com';

-- Should return no results
SELECT * FROM posts;
```

## Public Website Access

If your public website needs to read published posts without authentication, uncomment the public policy at the bottom of `supabase-rls-simple.sql`:

```sql
CREATE POLICY "Public can read published posts"
  ON posts
  FOR SELECT
  TO anon
  USING (published = true);
```

## Troubleshooting

### Cannot Access Data After Enabling RLS
- Verify your email is in the `is_authorized_email` function
- Check that Google OAuth is properly configured in Supabase
- Ensure the JWT contains your email claim

### Need to Disable RLS Temporarily
```sql
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
```

## Sync with NextAuth
Make sure your authorized emails in Supabase match your `.env.local`:
```
AUTHORIZED_EMAILS=elliemgoetz@gmail.com,editor1@gmail.com,editor2@gmail.com
```

## Notes
- This approach doesn't require a users table
- Perfect for small teams with fixed access lists
- Easy to understand and maintain
- Minimal database overhead