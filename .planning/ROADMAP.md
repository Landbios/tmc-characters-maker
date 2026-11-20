# Roadmap: TMC Character Vault

## Milestones

- ✅ **v0.1 MVP** — Core character sheet builder, Supabase auth, public sharing, search/filter/sort/pagination, PDF export, responsive layout (Shipped prior to GSD bootstrap).
- 🚧 **v1.1 Expansion** — Phases 1–8 (Active).

## Phases (v1.1)

- [ ] **Phase 1: Roles, Permissions & Professors Section** — Harden RBAC + Supabase RLS and complete the Professors/Tutors section.
- [ ] **Phase 2: Own Characters Management & Import/Export** — Dedicated personal character management screen, character import, and CSV export.
- [ ] **Phase 3: Modern Sci-Fi Academia UI & Visual Effects** — Elevated visual effects, theme polish, and UI refinement without clutter.
- [ ] **Phase 4: Main Chat Module Integration & Live Status Banner** — Connect vault auth/profiles to the main chat module and add the live health/mana status banner.
- [ ] **Phase 5: Discord Bot Integration (Tupperbox-style)** — Tupperbox-style Discord proxying and automatic character creation from Discord.
- [ ] **Phase 6: Cross-Platform Integration (Electron & React Native)** — Desktop (Electron) and mobile (React Native) integration research and delivery.
- [x] **Phase 7: Rich Text Section & Storytelling Effects** — Paragraph line breaks, stylized text effects (glitch, crisp, old-communication quotes), and deeper text-section customization for character backstories.
- [x] **Phase 8: Collapsible Section Groups & Ambient Music Blocks** — Collapsible multi-item section groups (text, images, separators, music) in the Diseño Web tab plus click-to-play YouTube ambient music blocks for storytelling.

## Phase Details

### Phase 1: Roles, Permissions & Professors Section
**Goal:** Establish enforceable role-based access control (student, professor/tutor, admin) across Supabase RLS and Next.js routes, and complete the Professors/Tutors section (`/tutores`).  
**Depends on:** v0.1 baseline  
**Requirements:** AUTH-01, AUTH-02, PROF-01  
**Success Criteria:**
1. User roles are stored, enforced by Supabase RLS policies, and validated on protected API routes and `/admin` + `/tutores` pages.
2. Unauthenticated users can still view public `/character/[id]` links, while unauthorized edits/deletes are rejected at both API and DB layers.
3. The Professors section (`/tutores`) is complete, role-aware, and aligned with the sci-fi academy design.

### Phase 2: Own Characters Management & Import/Export
**Goal:** Give authenticated users a dedicated screen to manage all of their own characters and support reliable character import and CSV export.  
**Depends on:** Phase 1  
**Requirements:** CHAR-01, CHAR-02, CHAR-03  
**Success Criteria:**
1. Logged-in users have a clear "Own Characters" management view with quick actions (view, edit, share, delete, export).
2. Users can import characters from supported file formats with validation and clear error feedback.
3. Users can export character data to CSV in addition to existing PDF export.

### Phase 3: Modern Sci-Fi Academia UI & Visual Effects
**Goal:** Upgrade the visual polish with modern sci-fi academy effects and styling across light, dark, and system themes while keeping the UI clean and responsive.  
**Depends on:** Phase 2  
**Requirements:** UI-01, UI-02  
**Success Criteria:**
1. Light (white/blue), dark (black/blue), and system themes render harmoniously with upgraded academy visual effects and smooth `motion` animations.
2. Mobile and desktop layouts remain uncluttered and performant, with the floating create button visible only on allowed routes.

### Phase 4: Main Chat Module Integration & Live Status Banner
**Goal:** Connect character vault authentication and profiles to the main TMC chat module and surface a compact live status banner (health, mana, etc.).  
**Depends on:** Phase 1  
**Requirements:** CHAT-01, CHAT-02  
**Success Criteria:**
1. Vault accounts and character profile avatars authenticate and sync cleanly with the main chat module.
2. A compact, unobtrusive status banner displays live character metrics (health, mana, and key stats) on the sheet/chat integration boundary.

### Phase 5: Discord Bot Integration (Tupperbox-style)
**Goal:** Enable Tupperbox-style character usage in Discord and automatic character creation in the vault from Discord commands/webhooks.  
**Depends on:** Phase 1, Phase 2  
**Requirements:** DISC-01, DISC-02  
**Success Criteria:**
1. Verified Discord webhook/bot endpoints (`/api/webhooks/discord` and character APIs) allow players to link and proxy their vault characters in Discord.
2. Users can trigger automatic character creation from the Discord bot, creating a valid editable sheet in TMC Character Vault.

### Phase 6: Cross-Platform Integration (Electron & React Native)
**Goal:** Research, architect, and integrate desktop (Electron) and mobile (React Native) clients for TMC Character Vault.  
**Depends on:** Phase 3  
**Requirements:** PLAT-01, PLAT-02  
**Success Criteria:**
1. An Electron desktop wrapper/integration builds and runs TMC Character Vault cleanly with auth and exports working.
2. A React Native mobile integration plan and starter/client connects to Supabase auth and character viewing/management flows.

### Phase 7: Rich Text Section & Storytelling Effects
**Goal:** Upgrade the character sheet text section into a customizable storytelling tool with explicit paragraph line breaks, stylized sci-fi text effects (glitched text, crisp/sharp text, old-communication/transmission-style quotes), and expanded customization options for roleplayers writing character backstories.  
**Depends on:** v0.1 baseline (independent; complements Phase 3)  
**Requirements:** TEXT-01, TEXT-02, TEXT-03  
**Success Criteria:**
1. Roleplayers can insert explicit line breaks and cleanly separated paragraphs inside text sections without losing formatting on save or reload.
2. Text sections support selectable visual styles/effects — including glitched text, crisp/high-contrast text, and old-communication / archival transmission quotes — rendering consistently in the editor, public character viewer (`/character/[id]`), and both light/dark themes.
3. Extended text customization options persist in Supabase character data and degrade gracefully in PDF/export views.

### Phase 8: Collapsible Section Groups & Ambient Music Blocks
**Goal:** Add collapsible section groups in the Diseño Web tab so creators can bundle multiple items (text, images, separators, music) without cluttering the editor or sheet, and add a YouTube ambient music block (and/or inline story trigger) that readers can click to play soundtrack music while reading specific parts of a character's story.  
**Depends on:** Phase 7  
**Requirements:** LAY-01, LAY-02, MEDIA-01, MEDIA-02  
**Success Criteria:**
1. Creators can add a collapsible Section Group in the Diseño Web tab, give it a title/default collapsed state, and add/reorder/edit nested items (rich text, images, separators, music) inside it while keeping the editor sidebar uncluttered.
2. Section Groups render cleanly as expandable/collapsible accordions on the character sheet viewer (`/character/[id]`) and live preview without breaking drag-and-drop reordering of top-level sections.
3. Creators can insert a Music Block (accepting standard YouTube watch/short/youtu.be links) with a custom track label/mood, and readers can click to play/pause ambient audio cleanly without unwanted autoplay.
4. All new group and music section data persists in existing Supabase JSONB `layout` without requiring a DB migration and degrades cleanly in PDF/print exports.

## Progress

| Phase | Plans Complete | Status | Completed |
| --- | --- | --- | --- |
| 1. Roles, Permissions & Professors Section | 0/0 | Not started | - |
| 2. Own Characters Management & Import/Export | 0/0 | Not started | - |
| 3. Modern Sci-Fi Academia UI & Visual Effects | 0/0 | Not started | - |
| 4. Main Chat Module Integration & Live Status Banner | 0/0 | Not started | - |
| 5. Discord Bot Integration (Tupperbox-style) | 0/0 | Not started | - |
| 6. Cross-Platform Integration (Electron & React Native) | 0/0 | Not started | - |
| 7. Rich Text Section & Storytelling Effects | 2/2 | Complete | 2026-11-19 |
| 8. Collapsible Section Groups & Ambient Music Blocks | 2/2 | Complete | 2026-11-20 |
