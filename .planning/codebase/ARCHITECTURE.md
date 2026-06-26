---
mapped_date: 2026-06-26
---
# Architecture

## Design Pattern
The app uses a standard React + Next.js App Router architecture.
- **Server Components (RSC)**: By default, the `app/` directory uses React Server Components.
- **Client Components**: Forms and highly interactive areas (e.g., `CharacterEditor.tsx`, `CharacterSheet.tsx`) are likely client components (using `"use client"`).

## Data Flow
- **State**: Global UI/Character state is managed via Zustand in `store/character-store.ts`.
- **Data Fetching**: Supabase is used directly for fetching and writing data. Database schema is version-controlled via SQL files in the root directory.

## Key Layers
- **UI Components**: Placed in `components/` and `components/ui/` (Radix/Tailwind components).
- **Hooks**: Custom hooks in `hooks/`.
- **Utils**: Helpers for URL parsing, image cropping, character IO, and combat stats in `utils/`.
