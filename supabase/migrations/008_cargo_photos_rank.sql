-- Add completed_count to driver_profiles
ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS completed_count INT NOT NULL DEFAULT 0;

-- Back-fill from existing completed matches
UPDATE driver_profiles dp
SET completed_count = (
  SELECT COUNT(*) FROM matches m
  WHERE m.driver_id = dp.user_id AND m.status = 'completed'
);

-- Atomic increment helper (avoids race conditions)
CREATE OR REPLACE FUNCTION increment_driver_completed_count(p_driver_id UUID)
RETURNS void AS $$
  UPDATE driver_profiles SET completed_count = completed_count + 1 WHERE user_id = p_driver_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Cargo photos table
CREATE TABLE IF NOT EXISTS cargo_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  phase       TEXT NOT NULL CHECK (phase IN ('before', 'after')),
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cargo_photos ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS cargo_photos_one_per_phase
ON cargo_photos(match_id, phase);

CREATE POLICY "match participants can view cargo photos"
ON cargo_photos FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM matches m
    JOIN orders o ON o.id = m.order_id
    WHERE m.id = cargo_photos.match_id
      AND (m.driver_id = auth.uid() OR o.shipper_id = auth.uid())
  )
);

CREATE POLICY "driver can insert cargo photos"
ON cargo_photos FOR INSERT TO authenticated
WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM matches WHERE id = match_id AND driver_id = auth.uid()
  )
);

ALTER PUBLICATION supabase_realtime ADD TABLE cargo_photos;

-- Storage bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('cargo-photos', 'cargo-photos', false, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/heic'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "match participants can read cargo photo files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'cargo-photos' AND
  EXISTS (
    SELECT 1 FROM matches m
    JOIN orders o ON o.id = m.order_id
    WHERE m.id::text = (storage.foldername(name))[1]
      AND (m.driver_id = auth.uid() OR o.shipper_id = auth.uid())
  )
);

CREATE POLICY "driver can upload cargo photo files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'cargo-photos' AND
  EXISTS (
    SELECT 1 FROM matches
    WHERE id::text = (storage.foldername(name))[1] AND driver_id = auth.uid()
  )
);
