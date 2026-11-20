'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Headphones, Film } from 'lucide-react';
import { MusicDisplayMode, Section } from '@/types/character';
import { extractYouTubeId } from '@/utils/youtube';

interface MusicBlockEditorProps {
  section: Section;
  onUpdate: (updates: Partial<Section>) => void;
}

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.58rem',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '0.25rem',
};

export function MusicBlockEditor({ section, onUpdate }: MusicBlockEditorProps) {
  const videoId = extractYouTubeId(section.musicUrl);
  const hasInput = Boolean(section.musicUrl && section.musicUrl.trim().length > 0);
  const currentMode: MusicDisplayMode = section.musicDisplayMode || 'ambient';

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#0353a4';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--border-light)';
  };

  const modeBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    padding: '0.38rem 0.5rem',
    borderRadius: '3px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.64rem',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    border: active ? '1px solid #0353a4' : '1px solid var(--border-light)',
    backgroundColor: active ? '#0353a4' : 'var(--surface)',
    color: active ? '#ffffff' : 'var(--text-muted)',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
      <div>
        <span style={labelStyle}>Título de la pista / ambiente</span>
        <input
          style={inputStyle}
          placeholder="Ej: Tema de Combate — Academia"
          value={section.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>

      <div>
        <span style={labelStyle}>Subtítulo / Artista (Opcional)</span>
        <input
          style={inputStyle}
          placeholder="Ej: Escena nocturna · OST"
          value={section.musicSubtitle || ''}
          onChange={(e) => onUpdate({ musicSubtitle: e.target.value })}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>

      <div>
        <span style={labelStyle}>Enlace de YouTube</span>
        <input
          style={inputStyle}
          placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
          value={section.musicUrl || ''}
          onChange={(e) => onUpdate({ musicUrl: e.target.value })}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {hasInput && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginTop: '0.3rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: videoId ? '#16a34a' : '#d97706',
            }}
          >
            {videoId ? (
              <>
                <CheckCircle2 size={12} />
                <span>YouTube válido (ID: {videoId})</span>
              </>
            ) : (
              <>
                <AlertCircle size={12} />
                <span>Enlace no reconocido — usa youtube.com/watch, youtu.be o shorts</span>
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <span style={labelStyle}>Modo de visualización en la ficha</span>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <button
            type="button"
            style={modeBtn(currentMode === 'ambient')}
            onClick={() => onUpdate({ musicDisplayMode: 'ambient' })}
          >
            <Headphones size={12} />
            <span>Barra Ambiental</span>
          </button>
          <button
            type="button"
            style={modeBtn(currentMode === 'video')}
            onClick={() => onUpdate({ musicDisplayMode: 'video' })}
          >
            <Film size={12} />
            <span>Video YouTube</span>
          </button>
        </div>
      </div>
    </div>
  );
}
