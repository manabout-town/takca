-- ============================================================
-- 휴대폰 OTP 인증 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS phone_otps (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone      TEXT NOT NULL,
  code       TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phone_otps_phone ON phone_otps(phone);
CREATE INDEX IF NOT EXISTS idx_phone_otps_expires ON phone_otps(expires_at);

-- Service role only — no RLS needed (accessed via service client)
ALTER TABLE phone_otps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_public_access" ON phone_otps FOR ALL TO authenticated USING (false);

-- ============================================================
-- 완료 요청 알림 트리거 개선 (SYSTEM 메시지 처리)
-- ============================================================
CREATE OR REPLACE FUNCTION notify_on_chat()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
  v_sender_name  TEXT;
  v_origin       TEXT;
  v_dest         TEXT;
  v_order_id     UUID;
  v_shipper_id   UUID;
BEGIN
  SELECT
    CASE WHEN o.shipper_id = NEW.sender_id THEN m.driver_id ELSE o.shipper_id END,
    o.origin,
    o.destination,
    o.id,
    o.shipper_id
  INTO v_recipient_id, v_origin, v_dest, v_order_id, v_shipper_id
  FROM matches m
  JOIN orders o ON o.id = m.order_id
  WHERE m.id = NEW.match_id;

  SELECT name INTO v_sender_name FROM users WHERE id = NEW.sender_id;

  -- SYSTEM 메시지 처리
  IF NEW.message = 'SYSTEM:COMPLETION_REQUESTED' THEN
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      v_shipper_id,
      'chat',
      '운송 완료 요청',
      v_sender_name || '님이 운송 완료를 요청했습니다. 확인 후 완료 처리해주세요.',
      '/shipper/orders/' || v_order_id
    );
    RETURN NEW;
  END IF;

  IF NEW.message LIKE 'SYSTEM:%' THEN
    RETURN NEW; -- 기타 시스템 메시지는 알림 안 보냄
  END IF;

  -- 일반 채팅 알림
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
