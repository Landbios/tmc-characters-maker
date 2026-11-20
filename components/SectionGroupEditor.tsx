'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useDroppable } from '@dnd-kit/core';
import {
  Type,
  Image as ImageIcon,
  Minus,
  Music,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Trash2,
  FolderOutput,
  FolderInput,
  Shield,
  Sword,
  Scroll,
} from 'lucide-react';
import { Section } from '@/types/character';
import { RichTextSectionEditor } from './RichTextSectionEditor';
import { MusicBlockEditor } from './MusicBlockEditor';
import ImageUploader from './ImageUploader';

interface SectionGroupEditorProps {
  section: Section;
  availableExternalSections?: Section[];
  onUpdate: (updates: Partial<Section>) => void;
  onMoveIntoGroup?: (sectionId: string) => void;
  onExtractChild: (childId: string) => void;
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

const addBtnStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '4.5rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.28rem',
  padding: '0.32rem 0.45rem',
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border-light)',
  borderRadius: '3px',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.62rem',
  cursor: 'pointer',
  transition: 'border-color 0.15s, color 0.15s',
};

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '0.2rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export function SectionGroupEditor({
  section,
  availableExternalSections = [],
  onUpdate,
  onMoveIntoGroup,
  onExtractChild,
}: SectionGroupEditorProps) {
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `group-drop:${section.id}`,
  });
  const children = section.children || [];
  const collapsibleOnSheet = section.collapsibleOnSheet !== false;
  const defaultCollapsed = section.defaultCollapsed === true;

  const addChild = (type: 'custom_text' | 'custom_image' | 'separator' | 'music_block') => {
    const id = uuidv4();
    const newChild: Section = {
      id,
      type,
      isCore: false,
      title:
        type === 'custom_text'
          ? 'Nueva Sección'
          : type === 'music_block'
            ? 'Tema Ambiental'
            : undefined,
      content: type === 'custom_text' ? 'Agrega tu contenido aquí...' : undefined,
      imageUrl: type === 'custom_image' || type === 'separator' ? '' : undefined,
      ...(type === 'custom_text'
        ? { textAlign: 'left' as const, containerStyle: 'plain' as const, fontSize: 'md' as const }
        : {}),
      ...(type === 'music_block'
        ? { musicUrl: '', musicSubtitle: '', musicDisplayMode: 'ambient' as const }
        : {}),
    };

    onUpdate({ children: [...children, newChild] });
    setExpandedChildId(id);
  };

  const updateChild = (childId: string, updates: Partial<Section>) => {
    onUpdate({
      children: children.map((c) => (c.id === childId ? { ...c, ...updates } : c)),
    });
  };

  const removeChild = (childId: string) => {
    onUpdate({
      children: children.filter((c) => c.id !== childId),
    });
    if (expandedChildId === childId) setExpandedChildId(null);
  };

  const moveChild = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= children.length) return;
    const next = [...children];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onUpdate({ children: next });
  };

  const getChildIcon = (type: string) => {
    switch (type) {
      case 'stats':
        return <Type size={12} />;
      case 'blaze':
        return <ImageIcon size={12} />;
      case 'battlefront':
      case 'clan':
        return <Shield size={12} />;
      case 'combat_data':
        return <Sword size={12} />;
      case 'noble_arts':
        return <Scroll size={12} />;
      case 'custom_text':
        return <Type size={12} />;
      case 'custom_image':
        return <ImageIcon size={12} />;
      case 'separator':
        return <Minus size={12} />;
      case 'music_block':
        return <Music size={12} />;
      default:
        return <Type size={12} />;
    }
  };

  const getChildLabel = (child: Section) => {
    switch (child.type as string) {
      case 'stats':
        return 'Estadísticas Básicas';
      case 'blaze':
        return 'Blaze & Elementos';
      case 'battlefront':
      case 'clan':
        return 'Frente de Batalla';
      case 'combat_data':
        return 'Datos de Combate';
      case 'noble_arts':
        return 'Artes Nobles';
      case 'custom_text':
        return child.title?.trim() || 'Texto';
      case 'custom_image':
        return 'Imagen';
      case 'separator':
        return 'Separador';
      case 'music_block':
        return child.title?.trim() || 'Música Ambiental';
      default:
        return 'Elemento';
    }
  };

  const isChildEditable = (child: Section) =>
    child.type === 'custom_text' ||
    child.type === 'custom_image' ||
    child.type === 'separator' ||
    child.type === 'music_block';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {/* Group Title */}
      <div>
        <span style={labelStyle}>Nombre del Grupo</span>
        <input
          style={inputStyle}
          placeholder="Ej: Historia — Capítulo 1"
          value={section.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#0353a4'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
        />
      </div>

      {/* Sheet Collapsible Behavior Toggles */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          padding: '0.5rem 0.65rem',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-light)',
          borderRadius: '4px',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.66rem',
            color: 'var(--text)',
          }}
        >
          <input
            type="checkbox"
            checked={collapsibleOnSheet}
            onChange={(e) => onUpdate({ collapsibleOnSheet: e.target.checked })}
            style={{ accentColor: '#0353a4', cursor: 'pointer' }}
          />
          <span>Colapsable también en la ficha (acordeón)</span>
        </label>

        {collapsibleOnSheet && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.66rem',
              color: 'var(--text-muted)',
              paddingLeft: '1.15rem',
            }}
          >
            <input
              type="checkbox"
              checked={defaultCollapsed}
              onChange={(e) => onUpdate({ defaultCollapsed: e.target.checked })}
              style={{ accentColor: '#0353a4', cursor: 'pointer' }}
            />
            <span>Iniciar cerrado al abrir la ficha</span>
          </label>
        )}
      </div>

      {/* Add Nested Item Toolbar */}
      <div>
        <span style={labelStyle}>Agregar elemento al grupo</span>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          <button type="button" style={addBtnStyle} onClick={() => addChild('custom_text')}>
            <Type size={11} /> Texto
          </button>
          <button type="button" style={addBtnStyle} onClick={() => addChild('custom_image')}>
            <ImageIcon size={11} /> Imagen
          </button>
          <button type="button" style={addBtnStyle} onClick={() => addChild('separator')}>
            <Minus size={11} /> Separador
          </button>
          <button type="button" style={addBtnStyle} onClick={() => addChild('music_block')}>
            <Music size={11} /> Música
          </button>
        </div>
      </div>

      {/* Pull existing external section into this group */}
      {onMoveIntoGroup && availableExternalSections.length > 0 && (
        <div>
          <span style={labelStyle}>Mover sección existente aquí</span>
          <select
            style={{ ...inputStyle, height: '2rem', fontSize: '0.72rem', cursor: 'pointer' }}
            value=""
            onChange={(e) => {
              if (e.target.value) {
                onMoveIntoGroup(e.target.value);
              }
            }}
          >
            <option value="">↳ Selecciona una sección externa…</option>
            {availableExternalSections.map((ext) => (
              <option key={ext.id} value={ext.id}>
                {getChildLabel(ext)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Drag-and-drop zone + Nested Children List */}
      <div
        ref={setDropRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          padding: '0.45rem',
          borderRadius: '4px',
          border: isOver ? '2px dashed #0353a4' : '1px dashed var(--border-light)',
          backgroundColor: isOver ? 'rgba(3, 83, 164, 0.08)' : 'transparent',
          transition: 'border-color 0.15s, background-color 0.15s',
        }}
      >
        {children.length === 0 ? (
          <div
            style={{
              padding: '0.55rem',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: isOver ? '#0353a4' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <FolderInput size={13} />
            <span>
              {isOver
                ? 'Suelta aquí para añadir al grupo'
                : 'Arrastra una sección aquí, usa el selector arriba o agrega un elemento.'}
            </span>
          </div>
        ) : (
          children.map((child, idx) => {
            const editable = isChildEditable(child);
            const isChildExpanded = editable && expandedChildId === child.id;
            return (
              <div
                key={child.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.55rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => editable && setExpandedChildId(isChildExpanded ? null : child.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      flex: 1,
                      minWidth: 0,
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: editable ? 'pointer' : 'default',
                      color: 'var(--text)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                      {getChildIcon(child.type)}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getChildLabel(child)}
                    </span>
                  </button>

                  <button
                    type="button"
                    style={{ ...iconBtnStyle, opacity: idx === 0 ? 0.3 : 1 }}
                    disabled={idx === 0}
                    title="Subir"
                    onClick={() => moveChild(idx, -1)}
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    style={{ ...iconBtnStyle, opacity: idx === children.length - 1 ? 0.3 : 1 }}
                    disabled={idx === children.length - 1}
                    title="Bajar"
                    onClick={() => moveChild(idx, 1)}
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    type="button"
                    style={iconBtnStyle}
                    title="Sacar del grupo (mover al nivel principal)"
                    onClick={() => onExtractChild(child.id)}
                  >
                    <FolderOutput size={12} />
                  </button>
                  {editable && (
                    <button
                      type="button"
                      style={iconBtnStyle}
                      title={isChildExpanded ? 'Colapsar' : 'Editar'}
                      onClick={() => setExpandedChildId(isChildExpanded ? null : child.id)}
                    >
                      {isChildExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}
                  {!child.isCore && (
                    <button
                      type="button"
                      style={{ ...iconBtnStyle, color: 'var(--danger)' }}
                      title="Eliminar elemento"
                      onClick={() => removeChild(child.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {isChildExpanded && (
                  <div
                    style={{
                      padding: '0.55rem 0.65rem',
                      borderTop: '1px solid var(--border-light)',
                      backgroundColor: 'var(--surface-alt)',
                    }}
                  >
                    {child.type === 'custom_text' && (
                      <RichTextSectionEditor
                        section={child}
                        onUpdate={(updates) => updateChild(child.id, updates)}
                      />
                    )}
                    {child.type === 'music_block' && (
                      <MusicBlockEditor
                        section={child}
                        onUpdate={(updates) => updateChild(child.id, updates)}
                      />
                    )}
                    {(child.type === 'custom_image' || child.type === 'separator') && (
                      <ImageUploader
                        label="URL o Archivo de Imagen"
                        value={child.imageUrl || ''}
                        onChange={(v) => updateChild(child.id, { imageUrl: v })}
                        maxSizeMB={5}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        {children.length > 0 && isOver && (
          <div
            style={{
              padding: '0.35rem',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: '#0353a4',
            }}
          >
            + Suelta aquí para añadir al grupo
          </div>
        )}
      </div>
    </div>
  );
}
