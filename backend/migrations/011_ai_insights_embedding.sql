ALTER TABLE ai_insights ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE INDEX IF NOT EXISTS ai_insights_embedding_idx
  ON public.ai_insights
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE OR REPLACE FUNCTION match_insights_by_embedding(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    p_user_id uuid
)
RETURNS TABLE (
    id uuid,
    insight_type text,
    summary text,
    structured_output_json jsonb,
    created_at timestamptz,
    similarity float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        i.id,
        i.insight_type,
        i.summary,
        i.structured_output_json,
        i.created_at,
        1 - (i.embedding <=> query_embedding) AS similarity
    FROM ai_insights i
    WHERE
        i.user_id = p_user_id
        AND i.insight_type = 'analyst_decision'
        AND i.embedding IS NOT NULL
        AND 1 - (i.embedding <=> query_embedding) > match_threshold
    ORDER BY i.embedding <=> query_embedding
    LIMIT match_count;
$$;
