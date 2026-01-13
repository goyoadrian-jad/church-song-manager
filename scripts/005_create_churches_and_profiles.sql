-- Create churches table
CREATE TABLE IF NOT EXISTS public.churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pastor_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Unique constraint to prevent duplicates based on name, city and pastor
  UNIQUE(name, city, pastor_name)
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE SET NULL,
  bio TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'Multimedia' CHECK (role IN ('Admin', 'Lider', 'Multimedia')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for churches table
-- All authenticated users can view churches
CREATE POLICY "Authenticated users can view churches"
  ON public.churches
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- All authenticated users can insert churches (for registration)
CREATE POLICY "Authenticated users can insert churches"
  ON public.churches
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can update/delete churches
CREATE POLICY "Admins can update churches"
  ON public.churches
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Admins can delete churches"
  ON public.churches
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );

-- RLS Policies for profiles table
-- Users can view all profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );

-- Admins can delete any profile
CREATE POLICY "Admins can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_churches_name ON public.churches(name);
CREATE INDEX IF NOT EXISTS idx_churches_city ON public.churches(city);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_church_id ON public.profiles(church_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Create function to search for similar churches
CREATE OR REPLACE FUNCTION public.search_similar_churches(
  p_name TEXT,
  p_city TEXT,
  p_pastor_name TEXT
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  pastor_name TEXT,
  address TEXT,
  city TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.pastor_name,
    c.address,
    c.city,
    (
      CASE 
        WHEN LOWER(c.name) = LOWER(p_name) AND LOWER(c.city) = LOWER(p_city) THEN 1.0
        WHEN LOWER(c.name) = LOWER(p_name) OR LOWER(c.pastor_name) = LOWER(p_pastor_name) THEN 0.8
        WHEN LOWER(c.city) = LOWER(p_city) AND (LOWER(c.name) LIKE '%' || LOWER(p_name) || '%' OR LOWER(p_name) LIKE '%' || LOWER(c.name) || '%') THEN 0.6
        ELSE 0.4
      END
    ) AS similarity
  FROM public.churches c
  WHERE 
    (LOWER(c.name) LIKE '%' || LOWER(p_name) || '%' OR LOWER(p_name) LIKE '%' || LOWER(c.name) || '%')
    OR LOWER(c.city) = LOWER(p_city)
    OR LOWER(c.pastor_name) = LOWER(p_pastor_name)
  ORDER BY similarity DESC
  LIMIT 5;
END;
$$;
