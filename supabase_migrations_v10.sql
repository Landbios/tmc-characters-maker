-- Migration: v10 - Fix Escuadrón bug
-- Description: Updates all existing characters with the invalid battlefront 'Escuadrón' to 'Akatsuki'

-- Update battlefront_name
UPDATE "public"."characters"
SET "battlefront_name" = 'Akatsuki'
WHERE "battlefront_name" = 'Escuadrón' OR "battlefront_name" IS NULL OR "battlefront_name" = '';

-- Also update clan_name to match, for backward compatibility
UPDATE "public"."characters"
SET "clan_name" = 'Akatsuki'
WHERE "clan_name" = 'Escuadrón' OR "clan_name" IS NULL OR "clan_name" = '';
