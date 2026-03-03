-- Migration to add quote customization fields to the characters table

ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS quote_font TEXT DEFAULT 'var(--font-cormorant)',
ADD COLUMN IF NOT EXISTS quote_color TEXT,
ADD COLUMN IF NOT EXISTS quote_size TEXT DEFAULT 'text-2xl md:text-3xl',
ADD COLUMN IF NOT EXISTS quote_italic BOOLEAN DEFAULT true;
