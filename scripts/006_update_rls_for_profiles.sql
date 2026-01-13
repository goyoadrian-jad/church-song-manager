-- Drop old policies that reference users table
DROP POLICY IF EXISTS "Admin and Lider can manage song types" ON public.song_types;
DROP POLICY IF EXISTS "Admin and Lider can manage songs" ON public.songs;

-- Create new policies using profiles table
CREATE POLICY "Admin and Lider can manage song types"
  ON public.song_types
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('Admin', 'Lider')
    )
  );

CREATE POLICY "Admin and Lider can manage songs"
  ON public.songs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('Admin', 'Lider')
    )
  );
