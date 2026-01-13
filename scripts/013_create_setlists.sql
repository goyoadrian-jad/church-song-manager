-- Create setlists table
CREATE TABLE IF NOT EXISTS public.setlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  leader_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('Miércoles', 'Domingo AM', 'Domingo PM')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create setlist_songs junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.setlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setlist_id UUID NOT NULL REFERENCES public.setlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(setlist_id, song_id),
  UNIQUE(setlist_id, position)
);

-- Enable Row Level Security
ALTER TABLE public.setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setlist_songs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for setlists
CREATE POLICY "Everyone can view setlists"
  ON public.setlists
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and Editors can create setlists"
  ON public.setlists
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('Admin', 'Editor y Creador')
    )
  );

CREATE POLICY "Admins and Editors can update setlists"
  ON public.setlists
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('Admin', 'Editor y Creador')
    )
  );

CREATE POLICY "Admins can delete setlists"
  ON public.setlists
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );

-- RLS Policies for setlist_songs
CREATE POLICY "Everyone can view setlist songs"
  ON public.setlist_songs
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and Editors can manage setlist songs"
  ON public.setlist_songs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('Admin', 'Editor y Creador')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_setlists_date ON public.setlists(date DESC);
CREATE INDEX IF NOT EXISTS idx_setlists_leader_id ON public.setlists(leader_id);
CREATE INDEX IF NOT EXISTS idx_setlist_songs_setlist_id ON public.setlist_songs(setlist_id);
CREATE INDEX IF NOT EXISTS idx_setlist_songs_song_id ON public.setlist_songs(song_id);
CREATE INDEX IF NOT EXISTS idx_setlist_songs_position ON public.setlist_songs(setlist_id, position);
