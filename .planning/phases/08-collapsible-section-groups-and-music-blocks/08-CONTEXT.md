# Phase 8: Collapsible Section Groups & Ambient Music Blocks — Context

**Gathered:** 2026-11-20  
**Status:** Ready for planning  
**Phase:** 08-collapsible-section-groups-and-music-blocks  
**Requirements:** LAY-01, LAY-02, MEDIA-01, MEDIA-02

<domain>
## Phase Boundary

Extend the **Diseño Web** (`layout`) tab and character sheet viewer with two cohesive storytelling/organization features:
1. **Collapsible Section Groups (`section_group`):** Multi-item containers in `character.layout` that bundle custom sections (rich text, images, separators, music) to keep the editor uncluttered and optionally render as expandable/collapsible accordions on the character sheet.
2. **YouTube Ambient Music (`music_block` + inline `[music:...]`):** Click-to-play YouTube soundtrack blocks (both Compact Ambient Bar and 16:9 Video Embed modes) usable as standalone sections, inside section groups, or directly inline inside a rich text story section.
</domain>

<decisions>
## Implementation Decisions

### 1. Collapsible Section Groups (`LAY-01`, `LAY-02`) — Locked
- **Editor behavior:** Every `section_group` is always collapsible in the Diseño Web sidebar, showing its group title and item count badge (e.g., `Historia — Cap. 1 (3)`) so creators don't have all nested items expanded at once.
- **Character sheet viewer behavior (configurable per group):**
  - `collapsibleOnSheet?: boolean` (default `true`):
    - When `true`, renders on the character sheet as a clean sci-fi academy accordion header (title + subtle chevron + item count/subtitle) that readers can expand/collapse.
    - `defaultCollapsed?: boolean` (default `false`): lets creators choose whether the accordion starts open or closed on the sheet.
    - When `false`, the group acts as an editor-only organizer folder and renders its child sections flat on the character sheet (with optional group title if desired, or seamless children).
- **Nesting rule:** Single-level grouping (groups contain `custom_text`, `custom_image`, `separator`, and `music_block` — no nested groups inside groups to keep UI & data clean).
- **Item management inside groups:**
  - Inside an expanded group in the editor, creators have quick `+ Texto`, `+ Imagen`, `+ Separador`, `+ Música` buttons.
  - Child items inside a group can be expanded/collapsed individually, edited inline, reordered (up/down buttons), deleted, or **moved out to top-level** ("Sacar del grupo").
  - Existing top-level custom sections (`custom_text`, `custom_image`, `separator`, `music_block`) get a quick **"Mover a grupo"** selector whenever at least one `section_group` exists.

### 2. YouTube Ambient Music (`MEDIA-01`, `MEDIA-02`) — Locked
- **Supported URL formats:** Parse and validate YouTube video IDs strictly from `youtube.com/watch?v=...`, `youtu.be/...`, `youtube.com/shorts/...`, `youtube.com/embed/...`, and `music.youtube.com/watch?v=...` (using `youtube-nocookie.com/embed/<id>` for privacy & clean embeds). Reject/warn on invalid URLs; never interpolate untrusted URLs into iframes.
- **Standalone `music_block` section:**
  - Can be added from the Diseño Web toolbar (`Música`) at top level OR inside any `section_group`.
  - Fields on `Section`: `musicUrl?: string`, `title?: string` (track/ambient label), `musicSubtitle?: string` (optional mood/artist note), `musicDisplayMode?: 'ambient' | 'video'` (default `'ambient'`).
  - **Two selectable display modes on the character sheet:**
    - **Compact Ambient Bar (`'ambient'`):** Sleek click-to-play soundtrack bar (play/stop button, animated subtle equalizer bars while playing, track title, mood/subtitle, external YouTube link). Clicking Play mounts a tiny hidden/visually-minimal `youtube-nocookie.com/embed/<id>?autoplay=1&loop=1&playlist=<id>` iframe so audio plays cleanly on user click without taking up video space. Clicking Stop unmounts the iframe cleanly.
    - **YouTube Video Embed (`'video'`):** Click-to-load 16:9 card showing a clean poster/thumbnail (`i.ytimg.com/vi/<id>/hqdefault.jpg`) with a play button overlay; clicking loads the `youtube-nocookie.com/embed/<id>?autoplay=1` iframe (zero autoplay on page load, fast initial page load).
- **Inline Rich Text Music Trigger (`[music:...]`):**
  - Added to the `RichTextSectionEditor` toolbar (`Música`) and `utils/richText.ts` parser.
  - Syntax: `[music:Título de pista|https://youtu.be/VIDEO_ID]` (or `[music:https://youtu.be/VIDEO_ID]`).
  - Renders inside `RichTextRenderer` as a compact click-to-play Ambient Music Bar right between paragraphs of a story!

### 3. Persistence, Security & Export Compatibility — Locked
- **Zero DB Migration:** All new fields (`children?: Section[]`, `collapsibleOnSheet?: boolean`, `defaultCollapsed?: boolean`, `musicUrl?: string`, `musicSubtitle?: string`, `musicDisplayMode?: 'ambient' | 'video'`) are optional properties inside the existing Supabase `character.layout` JSONB column.
- **No Autoplay:** Neither `'ambient'` nor `'video'` iframes mount until the reader explicitly clicks Play.
- **Single Active Ambient Track (Nice UX):** Optional lightweight coordination or clean per-player stop button; in `@media print` / PDF exports, music blocks degrade cleanly to a static track label (`♪ Track Name — YouTube`) with no broken iframe.

### Agent's Discretion
- Keep `CharacterEditor.tsx` lean by placing group editing and music editing/rendering in dedicated modular components (`utils/youtube.ts`, `components/MusicBlockPlayer.tsx`, `components/MusicBlockEditor.tsx`, `components/SectionGroupEditor.tsx`).
</decisions>

<code_context>
## Existing Code Insights

- [types/character.ts](../../types/character.ts): Extend `SectionType` with `'section_group' | 'music_block'` and `Section` with optional group & music fields.
- [components/CharacterEditor.tsx](../../components/CharacterEditor.tsx#L888-L935): Diseño Web (`activeTab === 'layout'`) toolbar adds `Grupo` and `Música` buttons; `SortableSectionRow` delegates `section_group` to `SectionGroupEditor` and `music_block` to `MusicBlockEditor`, plus adds "Mover a grupo" action on top-level custom sections when groups exist.
- [components/CharacterSheet.tsx](../../components/CharacterSheet.tsx#L62-L195): `renderSection` handles `section_group` (accordion or flat children via recursive `renderSection`) and `music_block` (via `MusicBlockPlayer`).
- [utils/richText.ts](../../utils/richText.ts), [components/RichTextRenderer.tsx](../../components/RichTextRenderer.tsx), [components/RichTextSectionEditor.tsx](../../components/RichTextSectionEditor.tsx): Add `[music:...]` block parsing, inline `MusicBlockPlayer` rendering, and toolbar button.
</code_context>

<deferred>
## Deferred Ideas

- Deeply nested groups (groups inside groups) — intentionally limited to 1 level for clarity and usability.
- Spotify/SoundCloud embeds or uploaded MP3 storage — YouTube links only in Phase 8.
</deferred>

---
*Phase: 08-collapsible-section-groups-and-music-blocks*  
*Context gathered: 2026-11-20*
