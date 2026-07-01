-- ============================================================
-- 013: 누락 테이블 + 알림 타입 수정
-- ============================================================

-- ============================================================
-- 1. driver_schedules (일정 등록 기능)
-- ============================================================
CREATE TABLE IF NOT EXISTS driver_schedules (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  origin_city    TEXT,
  origin_detail  TEXT,
  dest_regions   TEXT[] DEFAULT '{}',
  vehicle_type   TEXT,
  cargo_types    TEXT[] DEFAULT '{}',
  memo           TEXT,
  status         TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_schedules_driver_id ON driver_schedules(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_schedules_date ON driver_schedules(available_date);
CREATE INDEX IF NOT EXISTS idx_driver_schedules_status ON driver_schedules(status);

ALTER TABLE driver_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "driver_schedules_select" ON driver_schedules
  FOR SELECT TO authenticated
  USING (driver_id = auth.uid() OR true); -- 전체 공개 (화주도 기사 일정 조회 가능)

CREATE POLICY "driver_schedules_insert" ON driver_schedules
  FOR INSERT TO authenticated
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "driver_schedules_update" ON driver_schedules
  FOR UPDATE TO authenticated
  USING (driver_id = auth.uid());

CREATE POLICY "driver_schedules_delete" ON driver_schedules
  FOR DELETE TO authenticated
  USING (driver_id = auth.uid());

-- ============================================================
-- 2. notifications type CHECK 확장 (match_cancelled 추가)
-- ============================================================
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'match_request',
  'order_status',
  'chat',
  'escrow',
  'dispute',
  'match_cancelled'
));

-- ============================================================
-- 3. kyc-documents 스토리지 버킷 사전 생성
--    (API에서 동적 생성하지만 migration으로 보장)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- 어드민만 KYC 문서 조회 가능
CREATE POLICY "kyc_docs_admin_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'kyc-documents' AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- 본인 업로드 (service role via API, not direct user upload)
-- API uses service client so no RLS needed for inserts
