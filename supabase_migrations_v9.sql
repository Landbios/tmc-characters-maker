-- Migration v9: Add character_category column to classify students vs tutors
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS character_category TEXT DEFAULT 'student' 
  CHECK (character_category IN ('student', 'tutor'));

-- Update all existing characters to 'student' if null
UPDATE characters SET character_category = 'student' WHERE character_category IS NULL;
