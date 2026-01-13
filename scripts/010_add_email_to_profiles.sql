-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Update existing profiles with emails from auth.users (if any exist)
UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE p.user_id = au.id AND p.email IS NULL;

-- Create or replace trigger function to sync email from auth.users
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Get email from auth.users
  SELECT email INTO NEW.email
  FROM auth.users
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync email on insert
DROP TRIGGER IF EXISTS sync_profile_email_on_insert ON public.profiles;
CREATE TRIGGER sync_profile_email_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_email();
