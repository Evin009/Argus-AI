-- RPC function for semantic transaction search via pgvector cosine similarity.
-- Used by the RAG pipeline in the AI Copilot (Phase 4+).
CREATE OR REPLACE FUNCTION match_transactions_by_embedding(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    p_user_id uuid
)
RETURNS TABLE (
    id uuid,
    account_id uuid,
    merchant text,
    amount decimal,
    category text,
    subcategory text,
    "timestamp" timestamptz,
    is_recurring boolean,
    similarity float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        t.id,
        t.account_id,
        t.merchant,
        t.amount,
        t.category,
        t.subcategory,
        t."timestamp",
        t.is_recurring,
        1 - (t.embedding <=> query_embedding) AS similarity
    FROM transactions t
    JOIN accounts a ON a.id = t.account_id
    WHERE
        a.user_id = p_user_id
        AND t.embedding IS NOT NULL
        AND 1 - (t.embedding <=> query_embedding) > match_threshold
    ORDER BY t.embedding <=> query_embedding
    LIMIT match_count;
$$;
