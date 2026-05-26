-- backend/migrations/010_phase_3_5_intelligence.sql

ALTER TABLE bills ADD COLUMN IF NOT EXISTS ai_enrichment JSONB;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS ai_enrichment JSONB;

CREATE TABLE IF NOT EXISTS user_financial_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users ON DELETE CASCADE,
  profile JSONB NOT NULL DEFAULT '{}',
  analyst_version INTEGER DEFAULT 1,
  last_enriched_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_financial_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_user_policy"
  ON user_financial_profiles
  FOR ALL
  USING (user_id = auth.uid());
