-- backend/migrations/015_ai_predictions.sql

CREATE TABLE IF NOT EXISTS ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users ON DELETE CASCADE,
  prediction_type TEXT NOT NULL,
  prediction_payload JSONB NOT NULL,
  predicted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolves_at TIMESTAMPTZ NOT NULL,
  actual_outcome JSONB,
  was_accurate BOOLEAN
);

CREATE INDEX IF NOT EXISTS ai_predictions_resolution_idx
  ON ai_predictions (resolves_at)
  WHERE actual_outcome IS NULL;

ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_predictions_user_policy"
  ON ai_predictions
  FOR ALL
  USING (user_id = auth.uid());
