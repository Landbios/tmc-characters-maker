# Phase 7: Rich Text Section & Storytelling Effects — Context

**Gathered:** 2026-11-19  
**Status:** Ready for planning  
**Phase:** 07-rich-text-section-and-effects  
**Requirements:** TEXT-01, TEXT-02, TEXT-03

<domain>
## Phase Boundary

Upgrade the `custom_text` section of TMC Character Vault character sheets into a rich, customizable storytelling editor and renderer so roleplayers can write multi-paragraph character backstories with sci-fi text effects, old-communication quotes, redacted bars, and per-section typography/container customization — while staying 100% backward-compatible with existing Supabase JSONB `layout` data and degrading gracefully in PDF export and reduced-motion modes.
</domain>

<decisions>
## Implementation Decisions

### 1. Editing Model (Locked)
- **Inline formatting toolbar** inside the `custom_text` editor (no whole-section effect preset; users mix normal prose, effects, and quotes freely within a single text box).
- Selecting text in the textarea and clicking a toolbar button wraps the selection in the corresponding formatting tag (or inserts a template/placeholder at the cursor when nothing is selected).
- Dedicated **Line Break / Paragraph Divider** toolbar action in addition to native `Enter` (line break) and double `Enter` (paragraph break).

### 2. Text Effects & Formatting Catalog (Locked)
All 6 capabilities are in scope for Phase 7:
1. **Paragraph & Line Breaks (`TEXT-01`):**
   - Preserve single line breaks (`\n`) and render double line breaks (`\n\n`) as distinct spaced paragraphs.
   - Support an inline subtle story divider (e.g. `[hr]` / `---`) inside a text section to separate scenes or acts.
2. **Basic Rich Formatting (`TEXT-02`):**
   - Bold, italic, underline, and strikethrough.
3. **Glitched Text (`TEXT-02`):**
   - Subtle animated sci-fi glitch / chromatic flicker effect via CSS keyframes.
4. **Crisp / Sharp Text (`TEXT-02`):**
   - High-contrast, razor-sharp emphasis styling (clean tracking, crisp contrast, subtle sci-fi highlight).
5. **Old Communication / Transmission Quote (`TEXT-02`):**
   - Block-level vintage radio / archival terminal log box (monospace styling, subtle scanline/border accent, optional header/prefix like transmission indicator) suitable for intercepted logs, voice recordings, or academy comms.
6. **Classified / Redacted Text (`TEXT-02`):**
   - Blacked-out/censored inline bar that reveals the hidden text on hover or tap/click (accessible on both desktop and mobile).

### 3. Per-Section Customization Controls (Locked)
Added as optional fields on `Section` (`types/character.ts`) for `type === 'custom_text'` (`TEXT-03`):
- **Text Alignment:** `left` | `center` | `right` | `justify`. New `custom_text` sections default to `left` for story readability; existing legacy sections without `textAlign` preserve `center` (or sensible fallback) for backward compatibility.
- **Container Style:** `plain` (floating text) | `card` (Academy Card using the sheet's `cardBg` + subtle border) | `dossier` (Dossier / Terminal Frame with sci-fi corner/border accents).
- **Font Size:** `sm` | `md` (Normal) | `lg`.
- **Typography & Color Overrides:** Optional per-section `fontFamily` override and `textColor` override (falling back to the character sheet's global `font_body` and `text_color` when unset).

### 4. Storage, Security & Export Compatibility (Locked)
- **No DB Migration Required:** All new `Section` metadata fields are optional properties inside the existing `character.layout` JSONB array; existing characters load without errors.
- **Safe Rendering (No Raw HTML):** Use a lightweight, deterministic tag parser (`[b]`, `[i]`, `[u]`, `[s]`, `[glitch]`, `[crisp]`, `[redacted]`, `[comm]`, `[hr]`) that outputs React nodes directly — zero `dangerouslySetInnerHTML`, zero XSS surface, and full compatibility with plain-text legacy `section.content`.
- **PDF & Reduced-Motion Fallbacks:**
  - Respect `@media (prefers-reduced-motion: reduce)` by disabling glitch flicker animations and showing a static stylized glitch treatment.
  - Ensure print/PDF capture (`html2canvas-oklch` / `jspdf` and print styles) renders static stylized fallbacks for animated effects and readable contrast for redacted/comm blocks.

### Agent's Discretion
- Exact CSS keyframe tuning for glitch/crisp/dossier/comm aesthetics so they harmonize with both light (white/blue) and dark (black/blue) sci-fi academy themes as well as custom user `background_color` / `text_color`.
- Modular component split: keep `CharacterEditor.tsx` (currently ~52 KB) from growing by placing the new editor panel and parser/renderer in dedicated components/utilities (e.g. `utils/richText.tsx`, `components/RichTextRenderer.tsx`, `components/RichTextSectionEditor.tsx`).
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets & Integration Points
- [types/character.ts](../../types/character.ts): `Section` interface (`id`, `type`, `title?`, `content?`, `imageUrl?`, `isCore?`) — extend with optional `textAlign`, `containerStyle`, `fontSize`, `fontFamily`, `textColor`.
- [components/CharacterSheet.tsx](../../components/CharacterSheet.tsx#L171-L181): `case 'custom_text'` currently renders a plain `<p className="opacity-80 leading-relaxed">{section.content}</p>` inside a `text-center` wrapper. Replace with the new `RichTextRenderer` + container/style wrapper.
- [components/CharacterEditor.tsx](../../components/CharacterEditor.tsx#L306-L316) & [L1066-L1085](../../components/CharacterEditor.tsx#L1066-L1085): `addSection('custom_text')` defaults and inline section editor — wire to `RichTextSectionEditor`.
- [components/SortableSection.tsx](../../components/SortableSection.tsx#L79-L94): Secondary/legacy sortable section editor for `custom_text` — keep in sync or delegate to the same editor component if used.
- [app/globals.css](../../app/globals.css): Add scoped CSS classes and keyframes for `.rt-glitch`, `.rt-crisp`, `.rt-comm`, `.rt-redacted`, `.rt-dossier`, and `@media (prefers-reduced-motion: reduce)` / `@media print` fallbacks.
</code_context>

<deferred>
## Deferred Ideas

- Full WYSIWYG rich-text editor (TipTap/ProseMirror) — intentionally avoided to keep bundle size small, JSONB storage simple, and plain-text compatibility intact.
- Audio playback or interactive terminal commands inside comm quotes — out of scope for Phase 7.
</deferred>

---
*Phase: 07-rich-text-section-and-effects*  
*Context gathered: 2026-11-19*
