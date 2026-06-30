-- ============================================================
-- 012: orders 테이블 차량 필드 추가 (카 캐리어 플랫폼 전환)
-- ============================================================

-- 신규 컬럼 추가
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vehicle_count INT NOT NULL DEFAULT 1;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vehicle_notes TEXT;

-- cargo_type 은 nullable 처리 (기존 데이터 보존)
ALTER TABLE orders ALTER COLUMN cargo_type DROP NOT NULL;
