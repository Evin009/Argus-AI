-- backend/migrations/016_safe_to_spend_cache.sql

CREATE TABLE IF NOT EXISTS safe_to_spend_cache (
  user_id UUID PRIMARY KEY REFERENCES users ON DELETE CASCADE,
  safe_amount DECIMAL NOT NULL,
  breakdown JSONB NOT NULL DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE safe_to_spend_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "safe_to_spend_cache_user_policy"
  ON safe_to_spend_cache
  FOR ALL
  USING (user_id = auth.uid());
