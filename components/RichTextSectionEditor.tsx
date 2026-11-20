'use client';

import React, { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Zap,
  Sparkles,
  Radio,
  EyeOff,
  CornerDownLeft,
  Minus,
  Music,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { Section, TextAlign, TextContainerStyle, TextFontSize } from '@/types/character';

interface RichTextSectionEditorProps {
  section: Section;
  onUpdate: (updates: Partial<Section>) => void;
}

const SECTION_FONTS = [
  { name: 'Heredar de la ficha', value: '' },
  { name: 'Inter (Sans)', value: 'var(--font-inter)' },
  { name: 'Lato (Sans)', value: 'var(--font-lato)' },
  { name: 'Montserrat (Sans)', value: 'var(--font-montserrat)' },
  { name: 'Roboto (Sans)', value: 'var(--font-roboto)' },
  { name: 'Cormorant Garamond (Serif)', value: 'var(--font-cormorant)' },
  { name: 'Playfair Display (Serif)', value: 'var(--font-playfair)' },
  { name: 'Cinzel (Serif)', value: 'var(--font-cinzel)' },
  { name: 'Libre Baskerville (Serif)', value: 'var(--font-baskerville)' },
  { name: 'Monospace (Terminal)', value: 'var(--font-mono)' },
];

const COMM_COLOR_PRESETS = [
  { name: 'Terminal Verde', value: '#22c55e' },
  { name: 'Ámbar Retro', value: '#f59e0b' },
  { name: 'Cian Academia', value: '#06b6d4' },
  { name: 'Alerta Roja', value: '#ef4444' },
  { name: 'Frecuencia Violeta', value: '#a855f7' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--surface-alt)',
  border: '1px solid var(--border-light)',
  color: 'var(--text)',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.8rem',
  padding: '0.45rem 0.75rem',
  outline: 'none',
  transition: 'border-color 0.18s',
  height: '2.1rem',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--surface-alt)',
  border: '1px solid var(--border-light)',
  color: 'var(--text)',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.78rem',
  lineHeight: 1.55,
  padding: '0.55rem 0.75rem',
  outline: 'none',
  resize: 'vertical',
  minHeight: '130px',
  transition: 'border-color 0.18s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.58rem',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '0.25rem',
};

const toolBtnBase: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border-light)',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '0.28rem 0.42rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.25rem',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.62rem',
  borderRadius: '3px',
  transition: 'color 0.15s, border-color 0.15s, background-color 0.15s',
};

export function RichTextSectionEditor({ section, onUpdate }: RichTextSectionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showStyleControls, setShowStyleControls] = useState(false);
  const [showCommGuide, setShowCommGuide] = useState(false);

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#0353a4';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'var(--border-light)';
  };

  /**
   * Wraps the currently selected text in the textarea with `openTag` / `closeTag`,
   * or inserts a placeholder at the cursor when nothing is selected.
   */
  const wrapSelection = (openTag: string, closeTag: string, placeholder: string) => {
    const el = textareaRef.current;
    const current = section.content || '';
    if (!el) {
      onUpdate({ content: `${current}${openTag}${placeholder}${closeTag}` });
      return;
    }

    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const selected = current.slice(start, end);
    const inner = selected || placeholder;
    const nextValue = `${current.slice(0, start)}${openTag}${inner}${closeTag}${current.slice(end)}`;

    onUpdate({ content: nextValue });

    const newSelectionStart = start + openTag.length;
    const newSelectionEnd = newSelectionStart + inner.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newSelectionStart, newSelectionEnd);
    });
  };

  /**
   * Inserts a snippet (such as a paragraph break or `[hr]` divider) at the cursor.
   */
  const insertAtCursor = (snippet: string) => {
    const el = textareaRef.current;
    const current = section.content || '';
    if (!el) {
      onUpdate({ content: `${current}${snippet}` });
      return;
    }

    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const nextValue = `${current.slice(0, start)}${snippet}${current.slice(end)}`;
    onUpdate({ content: nextValue });

    const caret = start + snippet.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  const currentAlign: TextAlign = section.textAlign || 'center';
  const currentContainer: TextContainerStyle = section.containerStyle || 'plain';
  const currentSize: TextFontSize = section.fontSize || 'md';

  const pillBtn = (active: boolean): React.CSSProperties => ({
    ...toolBtnBase,
    flex: 1,
    padding: '0.32rem 0.5rem',
    backgroundColor: active ? '#0353a4' : 'var(--surface)',
    borderColor: active ? '#0353a4' : 'var(--border-light)',
    color: active ? '#ffffff' : 'var(--text-muted)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
      {/* Optional Title */}
      <input
        style={inputStyle}
        placeholder="Título de la sección (opcional)"
        value={section.title || ''}
        onChange={(e) => onUpdate({ title: e.target.value })}
        onFocus={onFocus}
        onBlur={onBlur}
      />

      {/* Inline Formatting & Storytelling Effects Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.28rem',
          padding: '0.35rem',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-light)',
          borderRadius: '4px',
        }}
      >
        {/* Basic Formatting */}
        <button
          type="button"
          style={toolBtnBase}
          title="Negrita ([b]...[/b])"
          onClick={() => wrapSelection('[b]', '[/b]', 'texto en negrita')}
        >
          <Bold size={12} />
        </button>
        <button
          type="button"
          style={toolBtnBase}
          title="Cursiva ([i]...[/i])"
          onClick={() => wrapSelection('[i]', '[/i]', 'texto en cursiva')}
        >
          <Italic size={12} />
        </button>
        <button
          type="button"
          style={toolBtnBase}
          title="Subrayado ([u]...[/u])"
          onClick={() => wrapSelection('[u]', '[/u]', 'texto subrayado')}
        >
          <Underline size={12} />
        </button>
        <button
          type="button"
          style={toolBtnBase}
          title="Tachado ([s]...[/s])"
          onClick={() => wrapSelection('[s]', '[/s]', 'texto tachado')}
        >
          <Strikethrough size={12} />
        </button>

        <span style={{ width: '1px', backgroundColor: 'var(--border-light)', margin: '0 0.15rem' }} />

        {/* Storytelling Effects */}
        <button
          type="button"
          style={toolBtnBase}
          title="Texto con Glitch ([glitch]...[/glitch])"
          onClick={() => wrapSelection('[glitch]', '[/glitch]', 'señal corrupta')}
        >
          <Zap size={12} />
          <span>Glitch</span>
        </button>
        <button
          type="button"
          style={toolBtnBase}
          title="Texto Nítido / Crisp ([crisp]...[/crisp])"
          onClick={() => wrapSelection('[crisp]', '[/crisp]', 'énfasis nítido')}
        >
          <Sparkles size={12} />
          <span>Crisp</span>
        </button>
        <button
          type="button"
          style={toolBtnBase}
          title="Cita de comunicación antigua ([comm:REGISTRO]...[/comm] o [comm:REGISTRO|#22c55e]...[/comm])"
          onClick={() => wrapSelection('\n[comm:TRANSMISIÓN #01]\n', '\n[/comm]\n', 'Registro de voz interceptado...')}
        >
          <Radio size={12} />
          <span>Comm</span>
        </button>
        <button
          type="button"
          style={toolBtnBase}
          title="Texto Clasificado / Censurado ([redacted]...[/redacted])"
          onClick={() => wrapSelection('[redacted]', '[/redacted]', 'dato clasificado')}
        >
          <EyeOff size={12} />
          <span>Censura</span>
        </button>

        <span style={{ width: '1px', backgroundColor: 'var(--border-light)', margin: '0 0.15rem' }} />

        {/* Paragraph & Divider Structure */}
        <button
          type="button"
          style={toolBtnBase}
          title="Insertar salto de línea / espacio extra (puedes pulsarlo varias veces como Enter)"
          onClick={() => insertAtCursor('\n')}
        >
          <CornerDownLeft size={12} />
          <span>Salto</span>
        </button>
        <button
          type="button"
          style={toolBtnBase}
          title="Insertar separador de escena ([hr])"
          onClick={() => insertAtCursor('\n\n[hr]\n\n')}
        >
          <Minus size={12} />
          <span>Divisor</span>
        </button>
        <button
          type="button"
          style={toolBtnBase}
          title="Insertar música ambiental de YouTube ([music:Título|URL])"
          onClick={() =>
            wrapSelection(
              '\n\n[music:',
              '|https://www.youtube.com/watch?v=VIDEO_ID]\n\n',
              'Tema Ambiental'
            )
          }
        >
          <Music size={12} />
          <span>Música</span>
        </button>

        <button
          type="button"
          style={{
            ...toolBtnBase,
            marginLeft: 'auto',
            borderColor: showCommGuide ? '#0353a4' : 'var(--border-light)',
            color: showCommGuide ? '#0353a4' : 'var(--text-muted)',
          }}
          title="Guía rápida de colores individuales para transmisiones [comm]"
          onClick={() => setShowCommGuide((prev) => !prev)}
        >
          <HelpCircle size={12} />
          <span>Guía Comm</span>
        </button>
      </div>

      {/* Collapsible Comm Color Guide + Quick Colored Comm Inserter */}
      {showCommGuide && (
        <div
          style={{
            padding: '0.55rem 0.65rem',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-light)',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.66rem',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <div style={{ color: 'var(--text)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Color individual por transmisión
          </div>
          <div>
            Agrega <code style={{ color: 'var(--text)' }}>|#HEX</code> después del título para dar un color único a esa transmisión:
          </div>
          <div
            style={{
              backgroundColor: 'var(--surface-alt)',
              border: '1px solid var(--border-light)',
              borderRadius: '3px',
              padding: '0.35rem 0.5rem',
              color: 'var(--text)',
              lineHeight: 1.5,
            }}
          >
            <div>[comm:SEÑAL #01|#22c55e] ... [/comm]</div>
            <div>[comm:#ef4444] ... [/comm]</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span>Insertar con color:</span>
            {COMM_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                title={`Insertar transmisión en ${preset.name} (${preset.value})`}
                onClick={() =>
                  wrapSelection(
                    `\n[comm:TRANSMISIÓN|${preset.value}]\n`,
                    '\n[/comm]\n',
                    'Registro de voz interceptado...'
                  )
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.18rem 0.4rem',
                  borderRadius: '3px',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--surface-alt)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    backgroundColor: preset.value,
                    display: 'inline-block',
                  }}
                />
                <span>{preset.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Story Content Textarea */}
      <textarea
        ref={textareaRef}
        style={textareaStyle}
        placeholder="Escribe la historia o notas de tu personaje… Usa Enter para saltos de línea, doble Enter para separar párrafos, o la barra superior para efectos."
        value={section.content || ''}
        onChange={(e) => onUpdate({ content: e.target.value })}
        onFocus={onFocus}
        onBlur={onBlur}
      />

      {/* Collapsible Per-Section Style Controls */}
      <div style={{ border: '1px solid var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setShowStyleControls((prev) => !prev)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.4rem 0.65rem',
            backgroundColor: 'var(--surface)',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <SlidersHorizontal size={11} />
            Estilo de Sección
          </span>
          {showStyleControls ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showStyleControls && (
          <div
            style={{
              padding: '0.65rem',
              borderTop: '1px solid var(--border-light)',
              backgroundColor: 'var(--surface-alt)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            {/* Text Alignment */}
            <div>
              <span style={labelStyle}>Alineación</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {(
                  [
                    { id: 'left', icon: <AlignLeft size={12} />, title: 'Izquierda' },
                    { id: 'center', icon: <AlignCenter size={12} />, title: 'Centrado' },
                    { id: 'right', icon: <AlignRight size={12} />, title: 'Derecha' },
                    { id: 'justify', icon: <AlignJustify size={12} />, title: 'Justificado' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    title={item.title}
                    style={pillBtn(currentAlign === item.id)}
                    onClick={() => onUpdate({ textAlign: item.id })}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Container Style */}
            <div>
              <span style={labelStyle}>Contenedor</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {(
                  [
                    { id: 'plain', label: 'Plano' },
                    { id: 'card', label: 'Tarjeta' },
                    { id: 'dossier', label: 'Dossier' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    style={pillBtn(currentContainer === item.id)}
                    onClick={() => onUpdate({ containerStyle: item.id })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <span style={labelStyle}>Tamaño de Texto</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {(
                  [
                    { id: 'sm', label: 'Pequeño' },
                    { id: 'md', label: 'Normal' },
                    { id: 'lg', label: 'Grande' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    style={pillBtn(currentSize === item.id)}
                    onClick={() => onUpdate({ fontSize: item.id })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family Override */}
            <div>
              <span style={labelStyle}>Tipografía (Opcional)</span>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={section.fontFamily || ''}
                onChange={(e) => onUpdate({ fontFamily: e.target.value || undefined })}
                onFocus={onFocus}
                onBlur={onBlur}
              >
                {SECTION_FONTS.map((f) => (
                  <option key={f.name} value={f.value}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Text Color Override */}
            <div>
              <span style={labelStyle}>Color de Texto (Opcional)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <input
                  type="color"
                  value={section.textColor || '#2D2D2D'}
                  onChange={(e) => onUpdate({ textColor: e.target.value })}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    padding: '2px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', flex: 1 }}>
                  {section.textColor || 'Heredado de la ficha'}
                </span>
                {section.textColor && (
                  <button
                    type="button"
                    title="Restablecer al color de la ficha"
                    style={toolBtnBase}
                    onClick={() => onUpdate({ textColor: undefined })}
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Transmission (Comm) Color Override */}
            <div>
              <span style={labelStyle}>Color de Transmisiones (Opcional)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                {COMM_COLOR_PRESETS.map((preset) => {
                  const active = section.commColor?.toLowerCase() === preset.value.toLowerCase();
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      title={`${preset.name} (${preset.value})`}
                      onClick={() => onUpdate({ commColor: preset.value })}
                      style={{
                        width: '1.35rem',
                        height: '1.35rem',
                        borderRadius: '3px',
                        backgroundColor: preset.value,
                        border: active ? '2px solid var(--text)' : '1px solid var(--border-light)',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    />
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <input
                  type="color"
                  value={section.commColor || '#22c55e'}
                  onChange={(e) => onUpdate({ commColor: e.target.value })}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    padding: '2px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', flex: 1 }}>
                  {section.commColor || 'Heredado del texto'}
                </span>
                {section.commColor && (
                  <button
                    type="button"
                    title="Restablecer color de transmisiones"
                    style={toolBtnBase}
                    onClick={() => onUpdate({ commColor: undefined })}
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
