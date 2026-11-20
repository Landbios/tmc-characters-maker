# Requirements: TMC Character Vault — v1.1

**Defined:** 2026-11-19  
**Source:** Ingested from [INSTRUCTIONS AND PLANNING.md](../INSTRUCTIONS%20AND%20PLANNING.md) (Section 2.2: V 1.1) and `.planning/codebase/`.

## v1.1 Requirements

### Roles, Permissions & Professors

- [ ] **AUTH-01**: Implement a complete roles and permissions system (e.g., student, professor/tutor, admin) backed by Supabase Row Level Security (RLS) policies and server-side route/API guards.
- [ ] **AUTH-02**: Ensure public unauthenticated viewing of shared character sheets (`/character/[id]`) remains intact while preventing unauthorized mutations.
- [ ] **PROF-01**: Complete the Professors / Tutors section (`/tutores`), allowing authorized roles to view, manage, and interact with professor-specific character/academy content.

### Character Management & Import/Export

- [ ] **CHAR-01**: Provide a dedicated "Own Characters" management screen where logged-in users can view, edit, duplicate, share, and delete their own characters in one place.
- [ ] **CHAR-02**: Implement a character import system with schema validation so users can import character sheets cleanly into their account.
- [ ] **CHAR-03**: Implement CSV export (alongside existing PDF/JSON export via `utils/characterIO.ts`) for portable character data and bulk/spreadsheet workflows.

### Sci-Fi Academia UI & Polish

- [ ] **UI-01**: Add refined visual effects and styling enhancements for a more modern sci-fi academia aesthetic across light (white/blue), dark (black/blue), and system themes.
- [ ] **UI-02**: Preserve responsive mobile/desktop ergonomics and uncluttered layout, including the animated floating "Create Character" button (hidden on create/edit/login/register pages).

### Main Chat Module & Status Banner

- [ ] **CHAT-01**: Connect TMC Character Vault authentication and character profiles (including top profile avatar) with the main TMC chat module.
- [ ] **CHAT-02**: Display a compact status banner with relevant live character data (health, mana, combat stats, etc.) synchronized with the chat module.

### Discord Bot Integration

- [ ] **DISC-01**: Integrate with a Discord bot (Tupperbox-style) using `/api/webhooks/discord` and character APIs so users can proxy/use their vault characters in Discord.
- [ ] **DISC-02**: Support automatic character creation in the vault triggered from the Discord bot with proper user/account linking.

### Cross-Platform Integration

- [ ] **PLAT-01**: Research and deliver desktop application integration with Electron wrapping the TMC Character Vault experience.
- [ ] **PLAT-02**: Research and deliver mobile application integration with React Native targeting iOS/Android workflows.

### Rich Text Section & Storytelling Effects

- [x] **TEXT-01**: Support explicit line breaks and paragraph separation inside character sheet text sections so roleplayers can structure long-form character stories cleanly.
- [x] **TEXT-02**: Add selectable sci-fi storytelling text effects and block styles, including glitched text, crisp/high-contrast text, and old-communication / transmission-style quotes.
- [x] **TEXT-03**: Expand text-section customization controls (typography, alignment, spacing, accents/styles) with full persistence in character data, public viewer rendering, and export compatibility.

### Collapsible Section Groups & Ambient Music Blocks

- [x] **LAY-01**: Allow creators in the Diseño Web tab to create collapsible section groups containing multiple nested items (rich text, images, separators, music) to keep the editor sidebar organized.
- [x] **LAY-02**: Render collapsible section groups as interactive expandable/collapsible containers on the character sheet viewer with configurable default open/closed state.
- [x] **MEDIA-01**: Add a YouTube Music Block section type that accepts standard YouTube links (`youtube.com/watch?v=...`, `youtu.be/...`, `youtube.com/shorts/...`) and lets readers click to play/pause ambient music for that part of the story.
- [x] **MEDIA-02**: Ensure YouTube embeds/players validate URLs safely, never autoplay without user interaction, and degrade cleanly to a labeled track reference in print/PDF exports.

## Traceability

| Requirement | Phase | Status |
| --- | --- | --- |
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| PROF-01 | Phase 1 | Pending |
| CHAR-01 | Phase 2 | Pending |
| CHAR-02 | Phase 2 | Pending |
| CHAR-03 | Phase 2 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| CHAT-01 | Phase 4 | Pending |
| CHAT-02 | Phase 4 | Pending |
| DISC-01 | Phase 5 | Pending |
| DISC-02 | Phase 5 | Pending |
| PLAT-01 | Phase 6 | Pending |
| PLAT-02 | Phase 6 | Pending |
| TEXT-01 | Phase 7 | Complete |
| TEXT-02 | Phase 7 | Complete |
| TEXT-03 | Phase 7 | Complete |
| LAY-01 | Phase 8 | Complete |
| LAY-02 | Phase 8 | Complete |
| MEDIA-01 | Phase 8 | Complete |
| MEDIA-02 | Phase 8 | Complete |

**Coverage:**
- v1.1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0
