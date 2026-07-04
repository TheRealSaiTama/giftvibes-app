
CREATE OR REPLACE FUNCTION public.bootstrap_first_owner()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'owner') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'owner');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created_bootstrap ON auth.users;
CREATE TRIGGER on_auth_user_created_bootstrap
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_owner();

-- helper: is any owner registered? (used to disable signup UI after first owner)
CREATE OR REPLACE FUNCTION public.owner_exists()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'owner') $$;
GRANT EXECUTE ON FUNCTION public.owner_exists() TO anon, authenticated;
