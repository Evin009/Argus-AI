-- backend/migrations/014_account_liability_fields.sql

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS interest_rate DECIMAL;
