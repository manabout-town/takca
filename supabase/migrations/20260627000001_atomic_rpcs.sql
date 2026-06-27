-- requestWithdrawal: 잔액 확인 + 차감 + 출금신청 + 트랜잭션 원자적 처리
CREATE OR REPLACE FUNCTION request_withdrawal_atomic(
  p_user_id UUID,
  p_amount BIGINT,
  p_bank_name TEXT,
  p_account_number TEXT,
  p_account_holder TEXT
) RETURNS JSON AS $$
DECLARE
  v_balance BIGINT;
  v_new_balance BIGINT;
  v_withdrawal_id UUID;
BEGIN
  SELECT balance INTO v_balance FROM wallets
  WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND OR v_balance < p_amount THEN
    RETURN json_build_object('error', 'insufficient_balance');
  END IF;

  v_new_balance := v_balance - p_amount;

  UPDATE wallets SET balance = v_new_balance, updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO withdrawal_requests
    (user_id, amount, bank_name, account_number, account_holder, status)
  VALUES
    (p_user_id, p_amount, p_bank_name, p_account_number, p_account_holder, 'pending')
  RETURNING id INTO v_withdrawal_id;

  INSERT INTO wallet_transactions
    (user_id, type, amount, balance_after, description, reference_id, status)
  VALUES (
    p_user_id, 'withdrawal', -p_amount, v_new_balance,
    FORMAT('출금 신청 — %s %s (%s)', p_bank_name, p_account_number, p_account_holder),
    v_withdrawal_id, 'pending'
  );

  RETURN json_build_object('success', true, 'withdrawal_id', v_withdrawal_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- acceptOrder: 상태 확인(FOR UPDATE) + match 생성 + order 상태 업데이트 원자적 처리
CREATE OR REPLACE FUNCTION accept_order_atomic(
  p_order_id UUID,
  p_driver_id UUID
) RETURNS JSON AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_match_id UUID;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'order_not_found');
  END IF;
  IF v_order.status != 'pending' THEN
    RETURN json_build_object('error', 'already_matched');
  END IF;
  IF v_order.shipper_id = p_driver_id THEN
    RETURN json_build_object('error', 'self_accept');
  END IF;

  INSERT INTO matches (order_id, driver_id, status, matched_at)
  VALUES (p_order_id, p_driver_id, 'accepted', NOW())
  RETURNING id INTO v_match_id;

  UPDATE orders SET status = 'matched' WHERE id = p_order_id;

  RETURN json_build_object('match_id', v_match_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- payouts 중복 방지: 동일 escrow에 대한 이중 정산 차단
ALTER TABLE payouts ADD CONSTRAINT payouts_escrow_id_unique UNIQUE (escrow_id);
