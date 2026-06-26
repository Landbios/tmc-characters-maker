---
mapped_date: 2026-06-26
---
# Structure

## Directory Layout
- `app/` - Next.js App Router pages and layouts (`admin`, `api`, `auth`, `character`, `dashboard`, `login`, `profile`, `shion-db`, `tutores`).
- `components/` - React components including `CharacterEditor.tsx`, `CharacterSheet.tsx`, `StudentIdExport.tsx`.
- `components/ui/` - Reusable UI elements (likely shadcn/ui derived).
- `hooks/` - Custom React hooks.
- `lib/` - Library configuration (`utils.ts`).
- `store/` - Zustand stores (`character-store.ts`).
- `types/` - TypeScript type definitions.
- `utils/` - Utility functions (`characterIO.ts`, `combatStats.ts`, `cropImage.ts`, `format.ts`, `url.ts`, `supabase/`).
- `public/` - Static assets.

## Database Migrations
- `supabase_migrations*.sql` and `supabase_schema.sql` are stored at the root, tracking the DB schema.
