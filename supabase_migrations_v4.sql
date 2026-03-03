-- =============================================================
-- Migration v4: Add all missing character fields
-- Run this in the Supabase SQL editor.
-- All statements use IF NOT EXISTS so they are safe to re-run.
-- =============================================================

-- ── Combat Stats (A–F rank, stored as single char) ──────────
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS offensive_power  text DEFAULT 'C',
  ADD COLUMN IF NOT EXISTS defensive_power  text DEFAULT 'C',
  ADD COLUMN IF NOT EXISTS mana_amount      text DEFAULT 'C',
  ADD COLUMN IF NOT EXISTS mana_control     text DEFAULT 'C',
  ADD COLUMN IF NOT EXISTS physical_ability text DEFAULT 'C',
  ADD COLUMN IF NOT EXISTS luck             text DEFAULT 'C';

-- ── Noble Arts (array of { id, name, cost, description }) ───
-- Stored as JSONB so the user can add as many arts as they want
-- with any fields without needing further migrations.
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS noble_arts jsonb DEFAULT '[]'::jsonb;

-- ── Image fit for the character portrait ────────────────────
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS image_fit text DEFAULT 'cover';

-- ── Layout (user-defined section order + custom sections) ───
-- Already added in v2 but reproduced here with the correct
-- default that matches the current DEFAULT_LAYOUT in the app.
-- The IF NOT EXISTS guard makes this a no-op if already present.
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS layout jsonb DEFAULT '[
    {"id": "stats",       "type": "stats",       "isCore": true},
    {"id": "blaze",       "type": "blaze",       "isCore": true},
    {"id": "battlefront", "type": "battlefront", "isCore": true},
    {"id": "combat_data", "type": "combat_data", "isCore": true},
    {"id": "noble_arts",  "type": "noble_arts",  "isCore": true}
  ]'::jsonb;

-- ── Backfill: give existing rows a proper default layout ─────
-- Only rows where layout is still the old v2 default (3-section)
-- or completely null get updated. Extra custom sections added
-- by users are left untouched.
UPDATE characters
SET layout = '[
  {"id": "stats",       "type": "stats",       "isCore": true},
  {"id": "blaze",       "type": "blaze",       "isCore": true},
  {"id": "battlefront", "type": "battlefront", "isCore": true},
  {"id": "combat_data", "type": "combat_data", "isCore": true},
  {"id": "noble_arts",  "type": "noble_arts",  "isCore": true}
]'::jsonb
WHERE layout IS NULL
   OR layout = '[{"id": "stats", "type": "stats", "isCore": true}, {"id": "blaze", "type": "blaze", "isCore": true}, {"id": "clan", "type": "clan", "isCore": true}]'::jsonb;

-- ── Full column reference (all columns the app expects) ──────
--
-- From schema.sql (initial):
--   id, user_id, name, subtitle, image_url,
--   age, height, nationality,
--   clan_name, clan_desc,         ← kept for backward compat
--   quote, theme_color, created_at
--
-- From migrations_v1:
--   font_heading, font_body,
--   background_color, background_image_url, background_overlay_opacity,
--   show_stats, show_elements, show_ability, show_clan   ← legacy toggles
--
-- From migrations_v2:
--   layout (jsonb), blaze_image_url,
--   element_user, element_blaze, element_advanced, blaze_type
--
-- From migrations_v3:
--   text_color, frame_style,
--   battlefront_name, battlefront_desc
--
-- From THIS migration (v4):
--   offensive_power, defensive_power,
--   mana_amount, mana_control,
--   physical_ability, luck,
--   noble_arts (jsonb),
--   image_fit

-- =============================================================
-- RLS policies are already set in schema.sql. No changes needed.
-- =============================================================
