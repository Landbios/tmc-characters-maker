# TMC Character Vault

## What This Is

TMC Character Vault is an independent character creation, customization, and management module built for the **TMC Roleplay** ecosystem. It provides a visual drag-and-drop character sheet builder (similar to Elementor/Divi) where players can add text, images, separators, backgrounds/GIFs, custom text colors, and resizable Blaze imagery, then share each character via a public, login-free URL or export it as a PDF. It also serves as the shared identity/character source for the broader TMC chat module.

## Core Value

Players can design, share, and manage richly customized sci-fi academy character sheets on both desktop and mobile, and seamlessly bring those characters into the TMC Roleplay chat and Discord ecosystems.

## Design & Architecture Decisions

- **Framework & Hosting:** Next.js 15 (App Router) + React 19, deployed on Vercel.
- **Database, Auth & Storage:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`) with PostgreSQL, Supabase Auth, and Supabase Storage for character assets.
- **Styling & Theme:** Tailwind CSS v4, Radix UI primitives, `lucide-react`, `motion`. Sci-fi academy aesthetic with clean, modern, uncluttered UI; light mode (white + blue), dark mode (black + blue), and system theme; responsive for mobile and desktop.
- **State Management:** Zustand (`store/character-store.ts`).
- **Builder & Export:** `@dnd-kit/*` for drag-and-drop sheet editing, `react-easy-crop` for image cropping, `jspdf` + `html2canvas-oklch` for PDF export.
- **Public Sharing:** Every character has a unique shareable URL (`/character/[id]`) accessible without authentication, while creation/editing/deletion require Supabase Auth.

## Baseline (v0.1 — Completed)

Shipped and active in the repository:
- Supabase Auth (login, register, auth callback, middleware).
- Drag-and-drop customizable character sheet builder, editor, viewer, and deletion flows.
- Character listing, search (name, battlefront, etc.), filtering, sorting, and pagination.
- Resizable Blaze image with optional borders, background image/GIF support, and text styling.
- PDF character sheet export (`/character/[id]/export`) and responsive mobile/desktop layout.
- Initial scaffolding for `/admin`, `/tutores`, `/profile`, `/dashboard`, `/shion-db`, `utils/characterIO.ts`, and `/api/webhooks/discord`.

## Current Milestone: v1.1

Target capabilities ingested from [INSTRUCTIONS AND PLANNING.md](../INSTRUCTIONS%20AND%20PLANNING.md):
- Roles and permissions system (RBAC + Supabase RLS hardening).
- Professors / Tutors section completion.
- Own characters management screen.
- Character import system and CSV export.
- Modernized sci-fi academia visual effects and style upgrades.
- Main chat module connection with live status banner (health, mana, etc.).
- Discord bot integration (Tupperbox-style proxying + automatic character creation).
- Desktop (Electron) and mobile (React Native) integration research & delivery.

## Known Technical Debt & Constraints

From [.planning/codebase/CONCERNS.md](codebase/CONCERNS.md) and [TESTING.md](codebase/TESTING.md):
- **Monolithic Components:** `components/CharacterEditor.tsx` (~52 KB) and `components/StudentIdExport.tsx` (~19 KB) need careful handling or incremental decomposition.
- **RLS Security:** Because character sheets are publicly readable without login, Supabase Row Level Security must strictly enforce write/role boundaries.
- **Root SQL Migrations:** 15 SQL migration files (`supabase_migrations*.sql`) currently live at the repo root.
- **Testing:** No automated test runner (Vitest/Playwright) is configured yet.
- **Client PDF Performance:** `jspdf` + `html2canvas-oklch` can be memory-intensive on mobile devices.

---
*Ingested from: `INSTRUCTIONS AND PLANNING.md` (PRD) + `.planning/codebase/*`*  
*Last updated: 2026-11-19*
