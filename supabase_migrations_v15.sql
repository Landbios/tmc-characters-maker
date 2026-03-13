-- Migration: v15 - Add is_npc to characters
-- Description: Adds a boolean column is_npc to characters table to distinguish NPCs.

-- 1. Add is_npc column to characters
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS is_npc boolean DEFAULT false;
