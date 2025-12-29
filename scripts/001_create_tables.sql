-- Create users table for extended user information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Lider', 'Multimedia')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create song_types table
CREATE TABLE IF NOT EXISTS public.song_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create songs table
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  youtube_link TEXT,
  multitrack_link TEXT,
  lyrics TEXT NOT NULL,
  key TEXT NOT NULL,
  chord_chart_link TEXT,
  song_type_id UUID REFERENCES public.song_types(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Admins can do everything
CREATE POLICY "Admin full access to users"
  ON public.users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Users can view all users
CREATE POLICY "Users can view all users"
  ON public.users
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for song_types table
-- All authenticated users can view song types
CREATE POLICY "Authenticated users can view song types"
  ON public.song_types
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only Admins and Liders can create/update/delete song types
CREATE POLICY "Admin and Lider can manage song types"
  ON public.song_types
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Lider')
    )
  );

-- RLS Policies for songs table
-- All authenticated users can view songs
CREATE POLICY "Authenticated users can view songs"
  ON public.songs
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admin and Lider can create/update/delete songs
CREATE POLICY "Admin and Lider can manage songs"
  ON public.songs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Lider')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_songs_song_type_id ON public.songs(song_type_id);
CREATE INDEX IF NOT EXISTS idx_songs_created_by ON public.songs(created_by);
