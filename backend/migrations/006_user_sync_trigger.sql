-- Auto-create a public.users row whenever someone signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, auth_provider, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_app_meta_data->>'provider',
    NEW.created_at
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing auth users who don't have a public.users row
INSERT INTO public.users (id, email, auth_provider, created_at)
SELECT
  id,
  email,
  raw_app_meta_data->>'provider',
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;
