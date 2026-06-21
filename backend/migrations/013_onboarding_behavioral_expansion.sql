-- backend/migrations/013_onboarding_behavioral_expansion.sql

ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS income_stability TEXT;
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS other_income BOOLEAN;
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS debts JSONB DEFAULT '[]';
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS impulse_spender TEXT;
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS spending_triggers TEXT[];
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS balance_check_frequency TEXT;
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS payment_preference TEXT;
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS overdraft_frequency TEXT;
ALTER TABLE onboarding_responses ADD COLUMN IF NOT EXISTS buffer_preference TEXT;
