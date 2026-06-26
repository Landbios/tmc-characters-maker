---
mapped_date: 2026-06-26
---
# Conventions

## Code Style
- **Language**: TypeScript (`.ts`, `.tsx`).
- **Styling**: Tailwind CSS classes. `cn` utility from `clsx` and `tailwind-merge` is used for class concatenation.
- **Linting**: ESLint and Next.js default rules (`eslint-config-next`).

## Components
- Extensively uses Radix UI for accessible base components.
- Modular component design. Uses specific components for logic sections (e.g., drag and drop uses `dnd-kit`).

## State Management
- Zustand used for global state to avoid excessive prop drilling.
