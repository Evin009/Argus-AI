-- backend/migrations/012_phase_4_schema_fixes.sql

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS closing_date DATE;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS minimum_payment DECIMAL;

CREATE TABLE IF NOT EXISTS onboarding_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users ON DELETE CASCADE,
  income DECIMAL,
  pay_schedule TEXT,
  rent DECIMAL,
  major_expenses JSONB DEFAULT '[]',
  goals JSONB DEFAULT '[]',
  risk_tolerance TEXT,
  completed_at TIMESTAMPTZ
);

ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onboarding_responses_user_policy"
  ON onboarding_responses
  FOR ALL
  USING (user_id = auth.uid());
