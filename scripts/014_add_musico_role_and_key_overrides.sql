-- Migración: rol "Musico" + tonalidad personal por setlist
-- Aditiva y NO destructiva: no modifica ni elimina datos existentes.

-- 1) Ampliar el CHECK de roles para incluir 'Musico'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role = ANY (ARRAY['Admin'::text, 'Editor y Creador'::text, 'Lector'::text, 'Musico'::text]));

-- 2) Permitir que 'Musico' cree canciones (INSERT)
DROP POLICY IF EXISTS "Admins and Editors can insert songs" ON public.songs;
CREATE POLICY "Admins and Editors can insert songs" ON public.songs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = ANY (ARRAY['Admin'::text, 'Editor y Creador'::text, 'Musico'::text])
    )
  );

-- 3) Tabla de tonalidad personal por setlist (override no destructivo)
CREATE TABLE IF NOT EXISTS public.song_key_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setlist_id uuid NOT NULL REFERENCES public.setlists(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  semitones integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, setlist_id, song_id)
);

ALTER TABLE public.song_key_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own key overrides select" ON public.song_key_overrides;
CREATE POLICY "Users manage own key overrides select" ON public.song_key_overrides
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users manage own key overrides insert" ON public.song_key_overrides;
CREATE POLICY "Users manage own key overrides insert" ON public.song_key_overrides
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = ANY (ARRAY['Admin'::text, 'Editor y Creador'::text, 'Musico'::text])
    )
  );

DROP POLICY IF EXISTS "Users manage own key overrides update" ON public.song_key_overrides;
CREATE POLICY "Users manage own key overrides update" ON public.song_key_overrides
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = ANY (ARRAY['Admin'::text, 'Editor y Creador'::text, 'Musico'::text])
    )
  );

DROP POLICY IF EXISTS "Users manage own key overrides delete" ON public.song_key_overrides;
CREATE POLICY "Users manage own key overrides delete" ON public.song_key_overrides
  FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_song_key_overrides_lookup
  ON public.song_key_overrides (user_id, setlist_id);
