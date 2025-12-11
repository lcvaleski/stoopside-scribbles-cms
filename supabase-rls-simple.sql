-- Simple RLS setup for Supabase with hardcoded authorized emails
-- This approach doesn't require a separate users table

-- Enable RLS on existing tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create a function to check if email is authorized
CREATE OR REPLACE FUNCTION is_authorized_email(user_email text)
RETURNS boolean AS $$
DECLARE
  authorized_emails text[] := ARRAY[
    -- IMPORTANT: Add your authorized Google emails here
    -- These should match the emails in your AUTHORIZED_EMAILS env variable
    'elliemgoetz@gmail.com',
    'loganvaleski@gmail.com'
    -- Add more emails as needed
  ];
BEGIN
  RETURN user_email = ANY(authorized_emails);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative: Create a configuration table for authorized emails (optional)
-- This is useful if you want to manage emails without modifying the function
CREATE TABLE IF NOT EXISTS authorized_emails (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on authorized_emails table
ALTER TABLE authorized_emails ENABLE ROW LEVEL SECURITY;

-- Only allow reading the authorized_emails table (no modifications through the app)
CREATE POLICY "Authorized users can read authorized_emails"
  ON authorized_emails
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM authorized_emails ae
      WHERE ae.email = auth.jwt()->>'email'
    )
  );

-- ============================================
-- RLS POLICIES FOR SITE_SETTINGS
-- ============================================

-- Allow authorized Google users to read site settings
CREATE POLICY "Authorized users can read site settings"
  ON site_settings
  FOR SELECT
  TO authenticated
  USING (
    is_authorized_email(auth.jwt()->>'email')
    OR EXISTS (
      SELECT 1 FROM authorized_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Allow authorized Google users to update site settings
CREATE POLICY "Authorized users can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (
    is_authorized_email(auth.jwt()->>'email')
    OR EXISTS (
      SELECT 1 FROM authorized_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Allow authorized Google users to insert site settings (though there should only be one row)
CREATE POLICY "Authorized users can insert site settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_authorized_email(auth.jwt()->>'email')
    OR EXISTS (
      SELECT 1 FROM authorized_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Allow authorized Google users to delete site settings
CREATE POLICY "Authorized users can delete site settings"
  ON site_settings
  FOR DELETE
  TO authenticated
  USING (
    is_authorized_email(auth.jwt()->>'email')
    OR EXISTS (
      SELECT 1 FROM authorized_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- ============================================
-- RLS POLICIES FOR POSTS
-- ============================================

-- Allow authorized Google users to read all posts
CREATE POLICY "Authorized users can read all posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    is_authorized_email(auth.jwt()->>'email')
    OR EXISTS (
      SELECT 1 FROM authorized_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Allow authorized Google users to create posts
CREATE POLICY "Authorized users can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_authorized_email(auth.jwt()->>'email')
    OR EXISTS (
      SELECT 1 FROM authorized_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Allow authorized Google users to update posts
CREATE POLICY "Authorized users can update posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (
    is_authorized_email(auth.jwt()->>'email')
    OR EXISTS (
      SELECT 1 FROM authorized_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Allow authorized Google users to delete posts
CREATE POLICY "Authorized users can delete posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (
    is_authorized_email(auth.jwt()->>'email')
    OR EXISTS (
      SELECT 1 FROM authorized_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- ============================================
-- OPTIONAL: Public read-only access for published posts
-- Uncomment if you want the public website to read published posts
-- ============================================

-- CREATE POLICY "Public can read published posts"
--   ON posts
--   FOR SELECT
--   TO anon
--   USING (published = true);

-- ============================================
-- OPTION 1: Insert authorized emails into table
-- (Use this if you want database-managed emails)
-- ============================================

-- INSERT INTO authorized_emails (email) VALUES
--   ('admin@stoopsidescribbles.com'),
--   ('editor1@gmail.com'),
--   ('editor2@gmail.com')
-- ON CONFLICT DO NOTHING;

-- ============================================
-- OPTION 2: Just use the function with hardcoded emails
-- (Simpler, but requires SQL changes to add/remove users)
-- ============================================

-- The is_authorized_email function above contains the list