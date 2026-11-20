'use client';

import React, { useState } from 'react';
import { Section } from '@/types/character';
import { parseRichText, RichTextBlock, RichTextInline } from '@/utils/richText';

interface RichTextRendererProps {
  section: Section;
  cardBg: string;
}

function RedactedSpan({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  const toggle = () => setRevealed((prev) => !prev);

  return (
    <span
      role="button"
      tabIndex={0}
      aria-pressed={revealed}
      title={revealed ? 'Clic para ocultar texto clasificado' : 'Texto clasificado — clic o pasa el cursor para revelar'}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      }}
      className={`rt-redacted ${revealed ? 'rt-redacted-revealed' : ''}`}
    >
      <span className="rt-redacted-inner">{children}</span>
    </span>
  );
}

function renderInlineNodes(nodes: RichTextInline[], keyPrefix: string): React.ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (node.type) {
      case 'text':
        return <React.Fragment key={key}>{node.value}</React.Fragment>;
      case 'br':
        return <br key={key} />;
      case 'bold':
        return (
          <strong key={key} className="font-semibold">
            {renderInlineNodes(node.children, key)}
          </strong>
        );
      case 'italic':
        return (
          <em key={key} className="italic">
            {renderInlineNodes(node.children, key)}
          </em>
        );
      case 'underline':
        return (
          <span key={key} className="underline underline-offset-4">
            {renderInlineNodes(node.children, key)}
          </span>
        );
      case 'strike':
        return (
          <del key={key} className="line-through opacity-75">
            {renderInlineNodes(node.children, key)}
          </del>
        );
      case 'glitch':
        return (
          <span key={key} className="rt-glitch">
            {renderInlineNodes(node.children, key)}
          </span>
        );
      case 'crisp':
        return (
          <span key={key} className="rt-crisp">
            {renderInlineNodes(node.children, key)}
          </span>
        );
      case 'redacted':
        return (
          <RedactedSpan key={key}>
            {renderInlineNodes(node.children, key)}
          </RedactedSpan>
        );
      default:
        return null;
    }
  });
}

function renderBlock(block: RichTextBlock, index: number): React.ReactNode {
  const key = `block-${index}`;
  switch (block.type) {
    case 'divider':
      return (
        <div key={key} className="rt-divider" aria-hidden="true">
          <span className="rt-divider-line" />
          <span className="text-[10px]">❖</span>
          <span className="rt-divider-line" />
        </div>
      );
    case 'comm':
      return (
        <blockquote key={key} className="rt-comm my-3">
          <div className="rt-comm-header">
            <span className="rt-comm-dot" aria-hidden="true" />
            <span>{block.header || 'TRANSMISIÓN ARCHIVADA'}</span>
          </div>
          <div className="text-[0.92em] leading-relaxed opacity-90">
            {renderInlineNodes(block.children, key)}
          </div>
        </blockquote>
      );
    case 'paragraph':
      return (
        <p key={key} className="opacity-85 leading-relaxed">
          {renderInlineNodes(block.children, key)}
        </p>
      );
    default:
      return null;
  }
}

export function RichTextRenderer({ section, cardBg }: RichTextRendererProps) {
  const blocks = parseRichText(section.content || '');

  // Preserve center alignment for legacy sections that have no textAlign saved
  const alignClass = (() => {
    switch (section.textAlign) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      case 'justify':
        return 'text-justify';
      case 'center':
      default:
        return 'text-center';
    }
  })();

  const sizeClass = (() => {
    switch (section.fontSize) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      case 'md':
      default:
        return 'text-base';
    }
  })();

  const containerStyle = section.containerStyle || 'plain';

  const containerClass = (() => {
    switch (containerStyle) {
      case 'card':
        return 'rounded-xl p-6 border border-white/30 transition-colors';
      case 'dossier':
        return 'rt-dossier p-6 transition-colors';
      case 'plain':
      default:
        return '';
    }
  })();

  const wrapperInlineStyle: React.CSSProperties = {
    ...(containerStyle !== 'plain' ? { backgroundColor: cardBg } : {}),
    ...(section.fontFamily ? { fontFamily: section.fontFamily } : {}),
    ...(section.textColor ? { color: section.textColor } : {}),
  };

  return (
    <div
      className={`w-full max-w-2xl space-y-3 ${alignClass} ${sizeClass} ${containerClass}`}
      style={wrapperInlineStyle}
    >
      {containerStyle === 'dossier' && (
        <>
          <span aria-hidden="true" className="pointer-events-none absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-current opacity-60" />
          <span aria-hidden="true" className="pointer-events-none absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-current opacity-60" />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-current opacity-60" />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-current opacity-60" />
        </>
      )}

      {section.title && (
        <h3
          className="text-xl tracking-wide"
          style={{
            fontFamily: section.fontFamily || 'var(--font-heading)',
            color: section.textColor || 'var(--text-color)',
          }}
        >
          {section.title}
        </h3>
      )}

      {blocks.length > 0 && (
        <div className="space-y-3">
          {blocks.map((block, index) => renderBlock(block, index))}
        </div>
      )}
    </div>
  );
}
