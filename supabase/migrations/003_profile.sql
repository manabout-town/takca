-- ============================================================
-- 프로필 확장 마이그레이션
-- ============================================================

-- users 테이블 확장
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname    TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url  TEXT;

-- driver_profiles 확장 (home_region/route_regions 누락 환경 대비)
ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS home_region      TEXT;
ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS route_regions    TEXT[] DEFAULT '{}';
ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS license_doc_url  TEXT;

-- shipper_profiles 확장 (company_name/business_number 누락 환경 대비)
ALTER TABLE shipper_profiles ADD COLUMN IF NOT EXISTS company_name      TEXT;
ALTER TABLE shipper_profiles ADD COLUMN IF NOT EXISTS business_number   TEXT;
ALTER TABLE shipper_profiles ADD COLUMN IF NOT EXISTS business_doc_url  TEXT;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 'documents', false, 10485760,
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES
-- ============================================================

-- 아바타: 공개 읽기, 본인만 업로드/수정
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]);

-- 문서: 본인만 읽기/쓰기
CREATE POLICY "documents_owner_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "documents_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "documents_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]);
