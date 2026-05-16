-- Add unique constraint on plaid_items(institution_id, user_id)
-- Required for the upsert on_conflict clause in the exchange-token endpoint
ALTER TABLE public.plaid_items
  ADD CONSTRAINT plaid_items_institution_user_unique
  UNIQUE (institution_id, user_id);
