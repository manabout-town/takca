-- KYC verification system for TakCa
-- Adds verification_status to users, creates kyc_submissions table
-- Also migrates orders table for car carrier (vehicle_count, vehicle_notes)

-- 1. Add verification_status to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified'
  CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

-- 2. KYC submissions table
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('shipper', 'driver')),
  business_registration_url TEXT NOT NULL,
  driver_license_url TEXT,
  ocr_result JSONB,
  government_api_result JSONB,
  claude_vision_result JSONB,
  confidence_score FLOAT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'manual_review')),
  rejection_reason TEXT,
  admin_note TEXT,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON kyc_submissions(status);

-- 3. Orders table: vehicle_count + vehicle_notes (카 캐리어 전용)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS vehicle_count INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS vehicle_notes TEXT;

-- 4. RLS policies for kyc_submissions
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kyc_user_select" ON kyc_submissions;
DROP POLICY IF EXISTS "kyc_user_insert" ON kyc_submissions;
DROP POLICY IF EXISTS "kyc_admin_all" ON kyc_submissions;

CREATE POLICY "kyc_user_select" ON kyc_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "kyc_user_insert" ON kyc_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "kyc_admin_all" ON kyc_submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. updated_at trigger
CREATE OR REPLACE FUNCTION update_kyc_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS kyc_submissions_updated_at ON kyc_submissions;
CREATE TRIGGER kyc_submissions_updated_at
  BEFORE UPDATE ON kyc_submissions
  FOR EACH ROW EXECUTE FUNCTION update_kyc_submissions_updated_at();
