-- Enable RLS on existing tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create a CMS users table to track authorized Google OAuth users
CREATE TABLE IF NOT EXISTS cms_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on cms_users table
ALTER TABLE cms_users ENABLE ROW LEVEL SECURITY;

-- Add trigger for cms_users updated_at
CREATE TRIGGER update_cms_users_updated_at
  BEFORE UPDATE ON cms_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cms_users_email ON cms_users(email);
CREATE INDEX IF NOT EXISTS idx_cms_users_google_id ON cms_users(google_id);

-- ============================================
-- RLS POLICIES FOR SITE_SETTINGS
-- ============================================

-- Allow authenticated CMS users to read site settings (Google OAuth)
CREATE POLICY "CMS users can read site settings"
  ON site_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cms_users
      WHERE cms_users.email = auth.jwt()->>'email'
      OR cms_users.google_id = auth.jwt()->>'sub'
    )
  );

-- Only admin users can update site settings
CREATE POLICY "Admin users can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cms_users
      WHERE (cms_users.email = auth.jwt()->>'email'
      OR cms_users.google_id = auth.jwt()->>'sub')
      AND cms_users.role = 'admin'
    )
  );

-- Only admin users can insert site settings (though there should only be one row)
CREATE POLICY "Admin users can insert site settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cms_users
      WHERE (cms_users.email = auth.jwt()->>'email'
      OR cms_users.google_id = auth.jwt()->>'sub')
      AND cms_users.role = 'admin'
    )
  );

-- Only admin users can delete site settings
CREATE POLICY "Admin users can delete site settings"
  ON site_settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cms_users
      WHERE (cms_users.email = auth.jwt()->>'email'
      OR cms_users.google_id = auth.jwt()->>'sub')
      AND cms_users.role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES FOR POSTS
-- ============================================

-- Allow authenticated CMS users to read all posts
CREATE POLICY "CMS users can read all posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cms_users
      WHERE cms_users.email = auth.jwt()->>'email'
      OR cms_users.google_id = auth.jwt()->>'sub'
    )
  );

-- Allow authenticated CMS users to create posts
CREATE POLICY "CMS users can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cms_users
      WHERE cms_users.email = auth.jwt()->>'email'
      OR cms_users.google_id = auth.jwt()->>'sub'
    )
  );

-- Allow authenticated CMS users to update posts
CREATE POLICY "CMS users can update posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cms_users
      WHERE cms_users.email = auth.jwt()->>'email'
      OR cms_users.google_id = auth.jwt()->>'sub'
    )
  );

-- Allow authenticated CMS users to delete posts
CREATE POLICY "CMS users can delete posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cms_users
      WHERE cms_users.email = auth.jwt()->>'email'
      OR cms_users.google_id = auth.jwt()->>'sub'
    )
  );

-- ============================================
-- RLS POLICIES FOR CMS_USERS
-- ============================================

-- Only admin users can read the cms_users table
CREATE POLICY "Admin users can read cms_users"
  ON cms_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cms_users u
      WHERE (u.email = auth.jwt()->>'email'
      OR u.google_id = auth.jwt()->>'sub')
      AND u.role = 'admin'
    )
  );

-- Only admin users can create new cms_users
CREATE POLICY "Admin users can create cms_users"
  ON cms_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cms_users
      WHERE (cms_users.email = auth.jwt()->>'email'
      OR cms_users.google_id = auth.jwt()->>'sub')
      AND cms_users.role = 'admin'
    )
  );

-- Only admin users can update cms_users
CREATE POLICY "Admin users can update cms_users"
  ON cms_users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cms_users
      WHERE (cms_users.email = auth.jwt()->>'email'
      OR cms_users.google_id = auth.jwt()->>'sub')
      AND cms_users.role = 'admin'
    )
  );

-- Only admin users can delete cms_users
CREATE POLICY "Admin users can delete cms_users"
  ON cms_users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cms_users
      WHERE (cms_users.email = auth.jwt()->>'email'
      OR cms_users.google_id = auth.jwt()->>'sub')
      AND cms_users.role = 'admin'
    )
  );

-- ============================================
-- OPTIONAL: Public read-only access for published posts
-- Uncomment if you want the public to read published posts
-- ============================================

-- CREATE POLICY "Public can read published posts"
--   ON posts
--   FOR SELECT
--   TO anon
--   USING (published = true);

-- ============================================
-- INITIAL ADMIN USER
-- Replace with your actual Google account email and Google ID
-- ============================================

-- Insert initial admin user (replace with your actual Google account details)
-- You can find your Google ID by logging into Supabase with Google and checking auth.users table
-- INSERT INTO cms_users (email, google_id, name, role)
-- VALUES ('your-google-email@gmail.com', 'your-google-user-id', 'Your Name', 'admin')
-- ON CONFLICT (email) DO NOTHING;