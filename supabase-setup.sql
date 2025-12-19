-- Supabase Setup SQL
-- Run this in your Supabase SQL Editor

-- Create penduduk table
CREATE TABLE IF NOT EXISTS penduduk (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  nik TEXT DEFAULT '-',
  rt TEXT NOT NULL CHECK (rt IN ('01', '02', '03')),
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_penduduk_nama ON penduduk(nama);
CREATE INDEX IF NOT EXISTS idx_penduduk_rt ON penduduk(rt);
CREATE INDEX IF NOT EXISTS idx_penduduk_created_at ON penduduk(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE penduduk ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON penduduk
  FOR SELECT
  USING (true);

-- Create policy to allow public insert access
CREATE POLICY "Allow public insert access" ON penduduk
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow public update access (optional, if needed in future)
CREATE POLICY "Allow public update access" ON penduduk
  FOR UPDATE
  USING (true);

-- Create policy to allow public delete access (optional, if needed in future)
CREATE POLICY "Allow public delete access" ON penduduk
  FOR DELETE
  USING (true);

-- Note: After running this SQL, you also need to:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a new bucket named: penduduk-photos
-- 3. Make it PUBLIC
-- 4. Set allowed MIME types: image/jpeg, image/png
-- 5. Set max file size: 5MB (5242880 bytes)
