-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admin full access to users" ON public.users;
DROP POLICY IF EXISTS "Admin and Lider can manage song types" ON public.song_types;
DROP POLICY IF EXISTS "Admin and Lider can manage songs" ON public.songs;

-- Create a function to get user role without causing recursion
-- This uses security definer to bypass RLS when checking roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = user_id;
  RETURN user_role;
END;
$$;

-- RLS Policies for users table (FIXED - no recursion)
-- Admins can do everything
CREATE POLICY "Admin full access to users"
  ON public.users
  FOR ALL
  USING (public.get_user_role(auth.uid()) = 'Admin');

-- RLS Policies for song_types table (FIXED)
-- Only Admins and Liders can create/update/delete song types
CREATE POLICY "Admin and Lider can manage song types"
  ON public.song_types
  FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('Admin', 'Lider'));

-- RLS Policies for songs table (FIXED)
-- Admin and Lider can create/update/delete songs
CREATE POLICY "Admin and Lider can manage songs"
  ON public.songs
  FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('Admin', 'Lider'));
