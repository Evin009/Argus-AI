ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_merchant_unique UNIQUE (user_id, merchant);
