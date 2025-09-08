-- Add is_pinned column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Create an index for faster queries on pinned posts
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON posts(is_pinned);

-- Optional: Add a constraint to limit the number of pinned posts
-- You can uncomment this if you want to limit to, say, 3 pinned posts
-- CREATE OR REPLACE FUNCTION check_pinned_posts_limit()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF NEW.is_pinned = TRUE THEN
--     IF (SELECT COUNT(*) FROM posts WHERE is_pinned = TRUE AND id != NEW.id) >= 3 THEN
--       RAISE EXCEPTION 'Cannot have more than 3 pinned posts';
--     END IF;
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER enforce_pinned_posts_limit
-- BEFORE INSERT OR UPDATE ON posts
-- FOR EACH ROW
-- EXECUTE FUNCTION check_pinned_posts_limit();