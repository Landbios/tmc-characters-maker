-- Migration: Add ID card photo fields to the characters table

ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS id_photo_url TEXT,
ADD COLUMN IF NOT EXISTS id_photo_border TEXT DEFAULT 'square';
