-- Migration V13: Fix Super Admin Profile Updates

-- Allow Superadmins to update any profile
DROP POLICY IF EXISTS "Superadmins can update any profile" ON public.profiles;

CREATE POLICY "Superadmins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );
