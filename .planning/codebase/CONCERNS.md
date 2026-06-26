---
mapped_date: 2026-06-26
---
# Concerns

## Technical Debt & Fragility
- **Large Components**: `components/CharacterEditor.tsx` (~52KB) and `components/StudentIdExport.tsx` (~19KB) might be monolithic and could benefit from further decomposition.
- **Testing**: Complete lack of automated tests in a complex UI (drag-and-drop builder, PDF exports).
- **Database Migrations**: Numerous SQL files (`supabase_migrations_v1` to `v15`) in the root directory instead of a dedicated `supabase/migrations` folder, leading to clutter.

## Security
- Ensure Supabase Row Level Security (RLS) is properly configured in the schema files to prevent unauthorized character modification, as characters can be shared and accessed without login.

## Performance
- PDF generation (`jspdf` + `html2canvas-oklch`) on the client side can be memory intensive and slow on mobile devices.
