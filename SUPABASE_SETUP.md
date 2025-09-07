# Supabase Setup Instructions

## 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `stoopside-cms`
   - Database Password: (save this securely)
   - Region: Choose closest to you
   - Click "Create new project"

## 2. Run the Database Schema
1. In your Supabase dashboard, go to the SQL Editor (left sidebar)
2. Click "New Query"
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the SQL

## 3. Get Your API Keys
1. In Supabase dashboard, go to Settings → API
2. Copy these values:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **Anon/Public Key**: `eyJ...` (long string)

## 4. Update Environment Variables

### Local Development (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

### Vercel Production
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key

## 5. Enable Row Level Security (Optional but Recommended)
For production, you should enable RLS:

```sql
-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read site settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Public can read published posts" ON posts
  FOR SELECT USING (published = true);

-- For write access, you'd need to implement proper auth
-- This is a simplified policy - adjust based on your needs
```

## 6. Test the Connection
1. Update your `.env.local` with the Supabase credentials
2. Run `npm run dev`
3. Visit `http://localhost:3000/dashboard/content`
4. Try adding a post and saving

## Troubleshooting
- If you get CORS errors, check that your Supabase URL is correct
- If data doesn't save, check the Supabase logs in the dashboard
- Make sure the tables were created by checking Database → Tables in Supabase