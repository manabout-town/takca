-- Add completion_requested_at to matches for correct 72h escrow auto-release
ALTER TABLE matches ADD COLUMN IF NOT EXISTS completion_requested_at TIMESTAMPTZ;

-- Prevent duplicate active matches per order (race condition fix)
CREATE UNIQUE INDEX IF NOT EXISTS matches_unique_active_per_order
ON matches(order_id)
WHERE status NOT IN ('cancelled', 'rejected');
