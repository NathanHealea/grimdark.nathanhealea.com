-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-profile-pictures', 'public-profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Grant select permission on the bucket to authenticated users (optional, but good practice for public buckets)
-- This allows anyone to list the files in the bucket, but not necessarily access the file content itself
-- (that's handled by object policies).
GRANT SELECT ON storage.buckets TO authenticated;