-- ============================================================
-- 알림 시스템
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN (
    'match_request',   -- 기사가 의뢰 수락 → 화주에게
    'order_status',    -- 의뢰 상태 변경 → 기사에게
    'chat',            -- 새 채팅 메시지
    'escrow',          -- 에스크로 상태 변경
    'dispute'          -- 분쟁 처리 결과
  )),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  link       TEXT,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- 트리거: 매칭 생성 시 화주에게 알림
-- ============================================================
CREATE OR REPLACE FUNCTION notify_shipper_on_match()
RETURNS TRIGGER AS $$
DECLARE
  v_shipper_id UUID;
  v_origin     TEXT;
  v_dest       TEXT;
  v_driver_name TEXT;
BEGIN
  SELECT o.shipper_id, o.origin, o.destination
  INTO v_shipper_id, v_origin, v_dest
  FROM orders o WHERE o.id = NEW.order_id;

  SELECT name INTO v_driver_name FROM users WHERE id = NEW.driver_id;

  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (
    v_shipper_id,
    'match_request',
    '기사님이 의뢰를 수락했습니다',
    v_driver_name || '님이 ' || v_origin || ' → ' || v_dest || ' 의뢰를 수락했습니다',
    '/shipper/orders/' || NEW.order_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_match_created_notify ON matches;
CREATE TRIGGER on_match_created_notify
  AFTER INSERT ON matches
  FOR EACH ROW EXECUTE FUNCTION notify_shipper_on_match();

-- ============================================================
-- 트리거: 의뢰 상태 변경 시 기사에게 알림
-- ============================================================
CREATE OR REPLACE FUNCTION notify_driver_on_order_status()
RETURNS TRIGGER AS $$
DECLARE
  v_driver_id UUID;
  v_title     TEXT;
  v_body      TEXT;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;

  SELECT driver_id INTO v_driver_id
  FROM matches WHERE order_id = NEW.id AND status != 'cancelled'
  LIMIT 1;

  IF v_driver_id IS NULL THEN RETURN NEW; END IF;

  v_title := CASE NEW.status
    WHEN 'in_progress' THEN '운송이 시작되었습니다'
    WHEN 'completed'   THEN '운송이 완료되었습니다'
    WHEN 'cancelled'   THEN '의뢰가 취소되었습니다'
    WHEN 'disputed'    THEN '분쟁이 접수되었습니다'
    ELSE '의뢰 상태가 변경되었습니다'
  END;

  v_body := NEW.origin || ' → ' || NEW.destination || ' 의뢰 상태: ' || NEW.status;

  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (
    v_driver_id,
    'order_status',
    v_title,
    v_body,
    '/driver/orders/' || NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_status_changed_notify ON orders;
CREATE TRIGGER on_order_status_changed_notify
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_driver_on_order_status();

-- ============================================================
-- 트리거: 새 채팅 메시지 시 상대방에게 알림
-- ============================================================
CREATE OR REPLACE FUNCTION notify_on_chat()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
  v_sender_name  TEXT;
  v_origin       TEXT;
  v_dest         TEXT;
BEGIN
  SELECT
    CASE WHEN o.shipper_id = NEW.sender_id THEN m.driver_id ELSE o.shipper_id END,
    o.origin,
    o.destination
  INTO v_recipient_id, v_origin, v_dest
  FROM matches m
  JOIN orders o ON o.id = m.order_id
  WHERE m.id = NEW.match_id;

  SELECT name INTO v_sender_name FROM users WHERE id = NEW.sender_id;

  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (
    v_recipient_id,
    'chat',
    v_sender_name || '님의 메시지',
    NEW.message,
    '/chat/' || NEW.match_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_chat_created_notify ON chats;
CREATE TRIGGER on_chat_created_notify
  AFTER INSERT ON chats
  FOR EACH ROW EXECUTE FUNCTION notify_on_chat();
