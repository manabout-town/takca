-- ============================================================
-- 009: orders 컬럼 추가 + bids 테이블 생성
-- ============================================================

-- orders에 누락된 컬럼 추가
ALTER TABLE orders ADD COLUMN IF NOT EXISTS title        TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vehicle_type TEXT;

-- ============================================================
-- BIDS 테이블 (기사 입찰)
-- ============================================================
CREATE TABLE IF NOT EXISTS bids (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price       INTEGER NOT NULL CHECK (price >= 1000),
  message     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(order_id, driver_id)
);

CREATE INDEX IF NOT EXISTS idx_bids_order_id  ON bids(order_id);
CREATE INDEX IF NOT EXISTS idx_bids_driver_id ON bids(driver_id);
CREATE INDEX IF NOT EXISTS idx_bids_status    ON bids(order_id, status);

-- RLS
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- 기사: 자신의 입찰 조회
-- 화주: 자신의 의뢰에 달린 입찰 조회
CREATE POLICY "bids_select" ON bids FOR SELECT TO authenticated
  USING (
    driver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM orders WHERE id = order_id AND shipper_id = auth.uid()
    )
  );

-- 기사만 입찰 가능
CREATE POLICY "bids_insert" ON bids FOR INSERT TO authenticated
  WITH CHECK (driver_id = auth.uid());

-- 기사는 자신의 입찰 수정 가능, 화주는 승인/거절 가능
CREATE POLICY "bids_update" ON bids FOR UPDATE TO authenticated
  USING (
    driver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM orders WHERE id = order_id AND shipper_id = auth.uid()
    )
  );

-- ============================================================
-- 트리거: 입찰 생성 시 화주에게 알림
-- ============================================================
CREATE OR REPLACE FUNCTION notify_shipper_on_bid()
RETURNS TRIGGER AS $$
DECLARE
  v_shipper_id  UUID;
  v_driver_name TEXT;
  v_origin      TEXT;
  v_dest        TEXT;
BEGIN
  SELECT o.shipper_id, o.origin, o.destination
  INTO v_shipper_id, v_origin, v_dest
  FROM orders o WHERE o.id = NEW.order_id;

  SELECT name INTO v_driver_name FROM users WHERE id = NEW.driver_id;

  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (
    v_shipper_id,
    'match_request',
    '새 입찰이 도착했습니다',
    v_driver_name || '님이 ' || v_origin || ' → ' || v_dest || ' 에 입찰했습니다 (' || NEW.price || '원)',
    '/shipper/orders/' || NEW.order_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_bid_created_notify ON bids;
CREATE TRIGGER on_bid_created_notify
  AFTER INSERT ON bids
  FOR EACH ROW EXECUTE FUNCTION notify_shipper_on_bid();
