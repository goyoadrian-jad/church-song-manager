-- Drop old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create new function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    first_name, 
    last_name, 
    church_id,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nuevo'),
    (NEW.raw_user_meta_data->>'church_id')::UUID,
    COALESCE(NEW.raw_user_meta_data->>'role', 'Multimedia')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Migrate existing users from users table to profiles (if any)
INSERT INTO public.profiles (user_id, first_name, last_name, role)
SELECT 
  u.id,
  COALESCE(u.first_name, 'Usuario'),
  COALESCE(u.last_name, 'Nuevo'),
  COALESCE(u.role, 'Multimedia')
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
LEFT JOIN public.users u ON u.id = au.id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
