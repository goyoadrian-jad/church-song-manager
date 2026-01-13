-- Remove church references from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS church_id;

-- Drop churches table and related objects
DROP FUNCTION IF EXISTS public.search_similar_churches(TEXT, TEXT, TEXT);
DROP INDEX IF EXISTS idx_churches_name;
DROP INDEX IF EXISTS idx_churches_city;
DROP INDEX IF EXISTS idx_profiles_church_id;
DROP TABLE IF EXISTS public.churches CASCADE;

-- Update roles constraint to new role system
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('Admin', 'Editor', 'Lector'));

-- Update default role to Lector
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'Lector';

-- Update existing roles: Lider and Multimedia become Editor
UPDATE public.profiles 
SET role = 'Editor' 
WHERE role IN ('Lider', 'Multimedia');

-- Update RLS policies for profiles based on new roles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Only admins can create profiles (for user management)
CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );

-- Users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile or admins view all"
  ON public.profiles
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );

-- Update songs RLS policies based on new roles
DROP POLICY IF EXISTS "Users can create songs" ON public.songs;
DROP POLICY IF EXISTS "Users can update songs" ON public.songs;
DROP POLICY IF EXISTS "Users can delete songs" ON public.songs;

-- Admins and Editors can create, update, delete songs
CREATE POLICY "Admins and Editors can create songs"
  ON public.songs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('Admin', 'Editor')
    )
  );

CREATE POLICY "Admins and Editors can update songs"
  ON public.songs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('Admin', 'Editor')
    )
  );

CREATE POLICY "Admins and Editors can delete songs"
  ON public.songs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('Admin', 'Editor')
    )
  );

-- All authenticated users can view songs (including Lector)
DROP POLICY IF EXISTS "Users can view songs" ON public.songs;
CREATE POLICY "Authenticated users can view songs"
  ON public.songs
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Update song_types RLS policies
DROP POLICY IF EXISTS "Users can create song types" ON public.song_types;
DROP POLICY IF EXISTS "Users can update song types" ON public.song_types;
DROP POLICY IF EXISTS "Users can delete song types" ON public.song_types;

CREATE POLICY "Admins and Editors can create song types"
  ON public.song_types
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('Admin', 'Editor')
    )
  );

CREATE POLICY "Admins and Editors can update song types"
  ON public.song_types
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('Admin', 'Editor')
    )
  );

CREATE POLICY "Admins and Editors can delete song types"
  ON public.song_types
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('Admin', 'Editor')
    )
  );

-- All authenticated users can view song types
DROP POLICY IF EXISTS "Users can view song types" ON public.song_types;
CREATE POLICY "Authenticated users can view song types"
  ON public.song_types
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
