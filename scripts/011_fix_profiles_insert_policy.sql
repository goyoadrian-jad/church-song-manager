-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create new policies for inserting profiles
-- Policy 1: Users can insert their own profile (for self-registration if needed)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Admins can insert any profile (for user management)
CREATE POLICY "Admins can insert any profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );
