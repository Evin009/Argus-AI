-- backend/migrations/017_merchant_logos.sql

CREATE TABLE IF NOT EXISTS merchant_logos (
  merchant TEXT PRIMARY KEY,
  logo_url TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
