-- Migration: v11 - Roles and Permissions
-- Description: Creates the profiles table, adds faction/status to characters, and updates RLS rules.

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  role text DEFAULT 'roleplayer'::text CHECK (role IN ('roleplayer', 'staff', 'superadmin')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'roleplayer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert existing auth users into profiles
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'roleplayer'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. Add columns to characters table
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS faction text,
ADD COLUMN IF NOT EXISTS status text;

-- 3. Update Characters RLS Policies
-- We need to allow staff and superadmin to UPDATE and DELETE any character.
-- Currently, we have:
-- "Users can update their own characters" (using (auth.uid() = user_id))
-- "Users can delete their own characters" (using (auth.uid() = user_id))

-- Drop existing restricted update/delete policies
DROP POLICY IF EXISTS "Users can update their own characters" ON characters;
DROP POLICY IF EXISTS "Users can delete their own characters" ON characters;

-- Create new UPDATE policy
CREATE POLICY "Users can update their own characters or staff/superadmins can update all"
  ON characters FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('staff', 'superadmin')
    )
  );

-- Create new DELETE policy
CREATE POLICY "Users can delete their own characters or staff/superadmins can delete all"
  ON characters FOR DELETE
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('staff', 'superadmin')
    )
  );
