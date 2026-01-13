-- Update songs table to reference profiles instead of users

-- First, drop the old foreign key constraint
ALTER TABLE public.songs DROP CONSTRAINT IF EXISTS songs_created_by_fkey;

-- Update the created_by column to reference profiles(user_id) instead of users(id)
-- Since profiles.user_id references auth.users(id), we need to map accordingly
-- For existing songs, we need to update the created_by to match the user_id in profiles

-- Add a temporary column to help with migration
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS created_by_temp UUID;

-- Copy existing created_by values (these reference users.id which is auth.users.id)
UPDATE public.songs 
SET created_by_temp = created_by 
WHERE created_by IS NOT NULL;

-- Now we need to update to reference the profile's user_id (which is the same as the old users.id)
-- The created_by should now reference profiles.user_id

-- Drop the old created_by column
ALTER TABLE public.songs DROP COLUMN IF EXISTS created_by;

-- Rename the temp column back to created_by
ALTER TABLE public.songs RENAME COLUMN created_by_temp TO created_by;

-- Add the new foreign key constraint to profiles(user_id)
ALTER TABLE public.songs 
ADD CONSTRAINT songs_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Create index for the foreign key
CREATE INDEX IF NOT EXISTS idx_songs_created_by ON public.songs(created_by);

-- Update RLS policies for songs to reference profiles instead of users
DROP POLICY IF EXISTS "Admin and Lider can manage songs" ON public.songs;

CREATE POLICY "Admin and Lider can manage songs"
  ON public.songs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('Admin', 'Lider')
    )
  );
