-- ============================================================
-- Feature 1: Vehicle Condition Reports
-- ============================================================
CREATE TABLE IF NOT EXISTS condition_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pickup', 'delivery')),
  photos JSONB NOT NULL DEFAULT '[]',  -- array of {url, caption}
  checklist JSONB NOT NULL DEFAULT '{}', -- {exterior_ok, glass_ok, tires_ok, interior_ok, engine_ok, mileage}
  notes TEXT,
  submitted_by UUID NOT NULL REFERENCES users(id),
  shipper_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_condition_reports_match_id ON condition_reports(match_id);

ALTER TABLE condition_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "condition_reports_read" ON condition_reports
  FOR SELECT USING (
    submitted_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM matches m
      JOIN orders o ON o.id = m.order_id
      WHERE m.id = condition_reports.match_id
      AND (m.driver_id = auth.uid() OR o.shipper_id = auth.uid())
    )
  );

CREATE POLICY "condition_reports_insert" ON condition_reports
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "condition_reports_update_shipper" ON condition_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM matches m
      JOIN orders o ON o.id = m.order_id
      WHERE m.id = condition_reports.match_id
      AND o.shipper_id = auth.uid()
    )
  );

-- ============================================================
-- Feature 2: Cancellation penalty columns on matches
-- ============================================================
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by_user UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS penalty_amount INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS penalty_status TEXT DEFAULT 'none'
    CHECK (penalty_status IN ('none', 'pending', 'collected', 'waived'));
