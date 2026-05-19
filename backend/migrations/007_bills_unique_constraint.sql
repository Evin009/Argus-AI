ALTER TABLE public.bills
  ADD CONSTRAINT bills_user_merchant_unique UNIQUE (user_id, merchant);
