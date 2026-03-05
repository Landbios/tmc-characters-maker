-- Migration V12: Fix "otros" category check constraint

-- First, drop the existing constraint restricting categories to only 'student' and 'tutor'
ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_character_category_check;

-- Second, add the updated constraint permitting 'student', 'tutor', and 'otros'
ALTER TABLE characters ADD CONSTRAINT characters_character_category_check CHECK (character_category IN ('student', 'tutor', 'otros'));
