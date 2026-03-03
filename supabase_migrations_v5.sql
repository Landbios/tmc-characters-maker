-- =============================================================
-- Migration v5: Add card overlay and blaze image options
-- Safe to re-run (IF NOT EXISTS guards).
-- =============================================================

ALTER TABLE characters
  -- Info box card background color (hex)
  ADD COLUMN IF NOT EXISTS card_bg_color   text    DEFAULT '#ffffff',
  -- Info box card background opacity 0–1
  ADD COLUMN IF NOT EXISTS card_bg_opacity float   DEFAULT 0.4,
  -- Whether to show the border & shadow around the Blaze portrait
  ADD COLUMN IF NOT EXISTS blaze_show_border boolean DEFAULT true,
  -- Size of the Blaze portrait (sm | md | lg | full)
  ADD COLUMN IF NOT EXISTS blaze_image_size text    DEFAULT 'md';
