# Setting Up Supabase Auth Users

## Step 1: Enable Email Auth in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider
4. Disable email confirmations (for internal use):
   - Go to **Authentication** → **Email Templates**
   - Under **Settings**, disable "Enable email confirmations"

## Step 2: Create Users in Supabase

Since you want preset passwords without signup, you'll need to create users manually:

### Option A: Using Supabase Dashboard (Easiest)

1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Add the first user:
   - Email: `elliemgoetz@gmail.com`
   - Password: (choose a secure password)
   - Auto Confirm Email: ✓ (check this)
4. Repeat for the second user:
   - Email: `loganvaleski@gmail.com`
   - Password: (choose a secure password)
   - Auto Confirm Email: ✓ (check this)

### Option B: Using SQL Editor

Run this in Supabase SQL Editor:

```sql
-- Create users directly in auth.users table
-- Replace 'your-password-here' with actual passwords

-- Note: Supabase doesn't allow direct password insertion via SQL for security
-- You must use the Dashboard method above or the Supabase Admin API
```

## Step 3: Test Login

1. Go to your app's signin page
2. Try logging in with:
   - Email: `elliemgoetz@gmail.com`
   - Password: (the password you set)

## Step 4: Verify RLS is Working

After logging in, the RLS policies will automatically check if the user's email matches the authorized emails in the `is_authorized_email` function.

## Important Security Notes

1. **Use strong passwords** - Since there's no signup flow, make sure passwords are secure
2. **Keep passwords safe** - Store them securely and share them only with the authorized users
3. **No password reset** - Without email confirmations, users won't be able to reset passwords themselves
4. **Consider enabling 2FA** later for additional security

## Troubleshooting

### Can't log in?
- Check that the email matches exactly (case-sensitive)
- Verify the user exists in Supabase Dashboard → Authentication → Users
- Check browser console for specific error messages

### Can see login but no data?
- Verify the email is in the `is_authorized_email` function in your RLS policies
- Check that RLS is enabled on your tables
- Test the RLS policies in Supabase SQL Editor

### Need to change a password?
1. Go to Supabase Dashboard → Authentication → Users
2. Find the user
3. Click the three dots → Reset password
4. Send them the new password directly