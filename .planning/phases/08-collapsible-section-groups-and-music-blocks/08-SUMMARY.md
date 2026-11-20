# Phase 8 Summary: Collapsible Section Groups & Ambient Music Blocks

**Completed:** 2026-11-20  
**Plans Executed:** `08-01-PLAN.md` (Wave 1), `08-02-PLAN.md` (Wave 2)  
**Requirements Covered:** `LAY-01`, `LAY-02`, `MEDIA-01`, `MEDIA-02`  
**Verification:** `npx tsc --noEmit` (PASS), `npm run build` (PASS — 15/15 pages in 9.4s)

## What Was Built

### Wave 1 — Data Model, YouTube Validation, Click-to-Play Player & Inline Story Music (`08-01`)
- **[types/character.ts](../../../types/character.ts):** Added `'section_group' | 'music_block'` to `SectionType`, `MusicDisplayMode = 'ambient' | 'video'`, and optional `children`, `collapsibleOnSheet`, `defaultCollapsed`, `musicUrl`, `musicSubtitle`, and `musicDisplayMode` fields on `Section` (zero DB migration).
- **[utils/youtube.ts](../../../utils/youtube.ts):** Strict 11-character YouTube ID extractor (`watch`, `youtu.be`, `shorts`, `embed`, `music.youtube.com`) and `youtube-nocookie.com` embed/thumbnail/watch helpers.
- **[components/MusicBlockPlayer.tsx](../../../components/MusicBlockPlayer.tsx):** Click-to-play YouTube player supporting both **Compact Ambient Bar** (audio-focused play/stop bar with subtle equalizer animation and visually-hidden iframe mounted only while playing) and **16:9 Video Embed** (click-to-load thumbnail card -> iframe) with zero autoplay and print/PDF fallbacks.
- **[app/globals.css](../../../app/globals.css):** Added `.rt-eq-bar` equalizer animation, `prefers-reduced-motion` fallback, and `@media print` iframe hiding.
- **[utils/richText.ts](../../../utils/richText.ts), [RichTextRenderer.tsx](../../../components/RichTextRenderer.tsx), [RichTextSectionEditor.tsx](../../../components/RichTextSectionEditor.tsx):** Added inline `[music:Título|URL]` / `[music:URL]` parsing, compact ambient rendering inside story text, and a `Música` button on the Rich Text toolbar.

### Wave 2 — Section Group & Music Editors + Diseño Web & Sheet Integration (`08-02`)
- **[components/MusicBlockEditor.tsx](../../../components/MusicBlockEditor.tsx):** Modular editor for `music_block` with track title, optional subtitle/mood, YouTube URL live validation badge, and Ambient Bar vs Video YouTube display mode selector.
- **[components/SectionGroupEditor.tsx](../../../components/SectionGroupEditor.tsx):** Modular editor for `section_group` with group title, `collapsibleOnSheet` and `defaultCollapsed` toggles, `+ Texto / + Imagen / + Separador / + Música` nested creation, per-child collapse/expand, up/down reordering, delete, and **Sacar del grupo** extraction to top-level.
- **[components/SectionGroupRenderer.tsx](../../../components/SectionGroupRenderer.tsx):** Interactive sci-fi academy accordion renderer for character sheets (or flat child rendering when `collapsibleOnSheet === false`).
- **[components/CharacterEditor.tsx](../../../components/CharacterEditor.tsx) & [CharacterSheet.tsx](../../../components/CharacterSheet.tsx):** Added `Grupo` and `Música` buttons to the Diseño Web toolbar, added **Mover a grupo** dropdown on existing top-level custom sections, and wired `section_group` and `music_block` into `CharacterSheet.tsx`.

## Deviations
None — executed cleanly as planned.
