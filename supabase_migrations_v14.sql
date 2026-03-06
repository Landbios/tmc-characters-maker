-- Migration: v14 - Profile Username
-- Description: Adds a username column to profiles and backfills it with the user's email. Updates trigger.

-- 1. Add username column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text;

-- 2. Backfill existing profiles
UPDATE public.profiles
SET username = email
WHERE username IS NULL;

-- 3. Update the handle_new_user function to set username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, username)
  VALUES (new.id, new.email, 'roleplayer', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
