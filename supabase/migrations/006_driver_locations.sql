-- Driver real-time location for GPS tracking
CREATE TABLE IF NOT EXISTS driver_locations (
  driver_id   UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  heading     FLOAT,
  speed       FLOAT,
  match_id    UUID REFERENCES matches(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Allow drivers to upsert their own location
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "driver can upsert own location"
  ON driver_locations FOR ALL
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- Shippers/drivers in same match can read location
CREATE POLICY "match participants can read location"
  ON driver_locations FOR SELECT
  USING (
    driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM matches m
      JOIN orders o ON o.id = m.order_id
      WHERE m.id = driver_locations.match_id
        AND o.shipper_id = auth.uid()
    )
  );

-- Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE driver_locations;
