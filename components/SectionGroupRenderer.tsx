'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Section } from '@/types/character';

interface SectionGroupRendererProps {
  section: Section;
  cardBg: string;
  renderChild: (child: Section) => React.ReactNode;
}

export function SectionGroupRenderer({
  section,
  cardBg,
  renderChild,
}: SectionGroupRendererProps) {
  const children = section.children || [];
  const collapsible = section.collapsibleOnSheet !== false;
  const [isOpen, setIsOpen] = useState(!(section.defaultCollapsed === true));

  if (children.length === 0) return null;

  // Editor-only organizer folder: render children flat on the character sheet
  if (!collapsible) {
    return (
      <div className="w-full flex flex-col items-center gap-6">
        {children.map((child) => (
          <React.Fragment key={child.id}>{renderChild(child)}</React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-3xl rounded-2xl border border-white/30 overflow-hidden transition-colors"
      style={{ backgroundColor: cardBg }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left cursor-pointer border-0 bg-transparent hover:bg-white/10 transition-colors"
      >
        <div className="min-w-0 flex items-center gap-3">
          <span className="text-xs opacity-50" aria-hidden="true">❖</span>
          <h3
            className="text-xl md:text-2xl truncate"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-color)' }}
          >
            {section.title?.trim() || 'Sección Agrupada'}
          </h3>
          <span className="text-[10px] font-mono uppercase tracking-widest opacity-55 px-2 py-0.5 rounded-full border border-current/20 shrink-0">
            {children.length}
          </span>
        </div>
        <span className="opacity-70 shrink-0">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {isOpen && (
        <div className="px-5 md:px-7 pb-6 pt-3 border-t border-current/10 flex flex-col items-center gap-6">
          {children.map((child) => (
            <React.Fragment key={child.id}>{renderChild(child)}</React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
