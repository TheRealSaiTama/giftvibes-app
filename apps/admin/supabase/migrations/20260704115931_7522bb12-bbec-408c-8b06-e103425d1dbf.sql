
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.owner_exists() FROM PUBLIC;
-- keep for anon so the auth page can show a first-time-setup banner; the function only returns a boolean
GRANT EXECUTE ON FUNCTION public.owner_exists() TO anon, authenticated;
