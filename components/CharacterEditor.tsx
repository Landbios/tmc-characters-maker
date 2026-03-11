'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section, SectionType, Rank, NobleArt } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';
import {
  Trash2, ArrowLeft, RefreshCw, Loader2, Save, Plus, GripVertical,
  Image as ImageIcon, Type, Minus, User, Palette, Layout,
  ChevronDown, ChevronUp, Shield, Sword, Scroll, Share2
} from 'lucide-react';
import { useCharacterStore } from '@/store/character-store';
import Link from 'next/link';
import ImageUploader from './ImageUploader';

const FONTS_HEADING = [
  { name: 'Cormorant Garamond', value: 'var(--font-cormorant)' },
  { name: 'Playfair Display', value: 'var(--font-playfair)' },
  { name: 'Cinzel', value: 'var(--font-cinzel)' },
  { name: 'Libre Baskerville', value: 'var(--font-baskerville)' },
];

const FONTS_BODY = [
  { name: 'Inter', value: 'var(--font-inter)' },
  { name: 'Lato', value: 'var(--font-lato)' },
  { name: 'Montserrat', value: 'var(--font-montserrat)' },
  { name: 'Roboto', value: 'var(--font-roboto)' },
];

/* ── Shared design tokens ────────────────────────────────── */
const S = {
  sidebar: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    overflowY: 'auto' as const,
    backgroundColor: 'var(--surface)',
    borderRight: '1px solid var(--border)',
  },
  input: {
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
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    backgroundColor: 'var(--surface-alt)',
    border: '1px solid var(--border-light)',
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    padding: '0.5rem 0.75rem',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '70px',
    transition: 'border-color 0.18s',
  } as React.CSSProperties,
  select: {
    width: '100%',
    backgroundColor: 'var(--surface-alt)',
    border: '1px solid var(--border-light)',
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    padding: '0.45rem 0.75rem',
    outline: 'none',
    height: '2.1rem',
    appearance: 'none' as const,
    cursor: 'pointer',
    transition: 'border-color 0.18s',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
    marginBottom: '0.3rem',
  } as React.CSSProperties,
  iconBtn: {
    background: 'none',
    border: '1px solid transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s, border-color 0.15s',
  } as React.CSSProperties,
  accentBtn: {
    backgroundColor: '#0353a4',
    color: '#fff',
    border: 'none',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    transition: 'background-color 0.18s',
  } as React.CSSProperties,
  outlineBtn: {
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    padding: '0.35rem 0.75rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    transition: 'border-color 0.15s, color 0.15s',
  } as React.CSSProperties,
  sectionHeader: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.62rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color: 'var(--label)',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '0.4rem',
    marginBottom: '0.75rem',
  } as React.CSSProperties,
  tabBtn: (active: boolean) => ({
    flex: 1,
    backgroundColor: active ? '#0353a4' : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)',
    border: 'none',
    borderBottom: active ? 'none' : '1px solid var(--border)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    padding: '0.5rem 0.25rem',
    cursor: 'pointer',
    transition: 'background-color 0.15s, color 0.15s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
  } as React.CSSProperties),
};

const onFocus = (e: React.FocusEvent<HTMLElement>) =>
  ((e.currentTarget as HTMLElement).style.borderColor = '#0353a4');
const onBlur = (e: React.FocusEvent<HTMLElement>) =>
  ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)');

export default function CharacterEditor() {
  const { character, setCharacter, updateField, reset } = useCharacterStore();
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [userRole, setUserRole] = useState<'roleplayer' | 'staff' | 'superadmin'>('roleplayer');
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'layout'>('content');
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user as Record<string, unknown> | null);
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (data && data.role) {
          setUserRole(data.role);
        }
      }
    };
    checkUser();
  }, [supabase]);

  useEffect(() => {
    const loadCharacter = async () => {
      if (id) {
        const { data, error } = await supabase.from('characters').select('*').eq('id', id).single();
        if (data && !error) {
          // ── Owner guard ───────────────────────────────────
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            const role = profile?.role || 'roleplayer';
            if (data.user_id && data.user_id !== user.id && !['staff', 'superadmin'].includes(role)) {
              toast.error('Acceso denegado — solo puedes editar tus propios personajes.');
              router.replace(`/character/${id}`);
              return;
            }
          }
          // ─────────────────────────────────────────────────
          if (!data.layout) {
            data.layout = [
              { id: 'stats', type: 'stats', title: 'Estadísticas Básicas', isCore: true },
              { id: 'blaze', type: 'blaze', title: 'Blaze & Elementos', isCore: true },
              { id: 'battlefront', type: 'battlefront', title: 'Frente de Batalla', isCore: true },
              { id: 'combat_data', type: 'combat_data', title: 'Datos de Combate', isCore: true },
              { id: 'noble_arts', type: 'noble_arts', title: 'Artes Nobles', isCore: true },
            ];
          }
          if (!data.noble_arts) data.noble_arts = [];
          setCharacter(data);
        }
      } else {
        reset();
      }
    };
    loadCharacter();
  }, [id, supabase, setCharacter, router, reset]);

  const handleSave = async () => {
    if (!user) {
      toast.error('Por favor inicia sesión para guardar personajes');
      router.push('/login');
      return;
    }
    setSaving(true);
    try {
      const characterData = { ...character, user_id: (user as { id: string }).id };
      
      // Default new or undefined characters to W.I.P
      characterData.status = characterData.status || 'w.i.p';

      // Strict battlefront check for non-tutors and non-staff
      const isNoFrontCategory = ['tutor', 'otros'].includes(characterData.character_category || 'student');
      
      if (isNoFrontCategory) {
        // Automatically erase front data if they are no-front categories
        characterData.battlefront_name = '';
        characterData.clan_name = '';
        characterData.battlefront_desc = '';
        characterData.clan_desc = '';
      } else if (!['staff', 'superadmin'].includes(userRole)) {
        const validFronts = ['Akatsuki', 'Kyomon', 'Rentei', 'Hagun'];
        const currentFront = characterData.battlefront_name || characterData.clan_name;
        if (!validFronts.includes(currentFront)) {
          characterData.battlefront_name = 'Akatsuki';
          characterData.clan_name = 'Akatsuki';
        }
      }

      if (characterData.id === 'demo') delete (characterData as Record<string, unknown>).id;
      const { data, error } = await supabase.from('characters').upsert(characterData).select().single();
      if (error) throw error;
      if (data) {
        setCharacter(data);
        toast.success('¡Personaje guardado!');
        if (!id) router.push(`/?id=${data.id}`);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al guardar: ' + msg);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    if (character.id === 'demo') {
      toast.error('¡Guarda tu personaje primero para obtener un enlace para compartir!');
      return;
    }
    const url = `${window.location.origin}/character/${character.id}`;
    navigator.clipboard.writeText(url);
    toast.success('¡Enlace público copiado al portapapeles!');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = character.layout.findIndex((item) => item.id === active.id);
      const newIndex = character.layout.findIndex((item) => item.id === over.id);
      updateField('layout', arrayMove(character.layout, oldIndex, newIndex));
    }
  };

  const addSection = (type: SectionType) => {
    const newSection: Section = {
      id: uuidv4(),
      type,
      isCore: false,
      title: type === 'custom_text' ? 'Nueva Sección' : undefined,
      content: type === 'custom_text' ? 'Agrega tu contenido aquí...' : undefined,
      imageUrl: type === 'custom_image' || type === 'separator' ? '' : undefined,
    };
    updateField('layout', [...character.layout, newSection]);
  };

  const removeSection = (id: string) => {
    updateField('layout', character.layout.filter(s => s.id !== id));
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    updateField('layout', character.layout.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addNobleArt = () => {
    const newArt: NobleArt = { id: uuidv4(), name: '', cost: '', description: '' };
    updateField('noble_arts', [...(character.noble_arts || []), newArt]);
  };

  const updateNobleArt = (id: string, field: keyof NobleArt, value: string) => {
    const updatedArts = (character.noble_arts || []).map(art =>
      art.id === id ? { ...art, [field]: value } : art
    );
    updateField('noble_arts', updatedArts);
  };

  const removeNobleArt = (id: string) => {
    updateField('noble_arts', (character.noble_arts || []).filter(art => art.id !== id));
  };

  return (
    <div style={S.sidebar}>

      {/* ── Top bar ──────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {user && (
            <Link href="/dashboard">
              <button
                title="Back to Dashboard"
                style={S.iconBtn}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#0353a4'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
              >
                <ArrowLeft size={16} />
              </button>
            </Link>
          )}
          <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)' }}>
            Editor
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            title="Reset"
            style={S.iconBtn}
            onClick={reset}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
          >
            <RefreshCw size={15} />
          </button>
          <button
            title="Save character"
            style={{ ...S.iconBtn, color: saving ? 'var(--text-muted)' : '#0353a4' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
          </button>
        </div>
      </div>

      {/* ── Not-logged-in warning ─────────────────────────── */}
      {!user && (
        <div style={{ margin: '0.75rem 1rem 0', padding: '0.6rem 0.8rem', border: '1px solid var(--border)', backgroundColor: 'var(--surface-alt)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>
          Modo demo —{' '}
          <Link href="/login" style={{ color: '#0353a4', textDecoration: 'underline' }}>
            inicia sesión
          </Link>{' '}
          para guardar personajes.
        </div>
      )}

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0, marginTop: '0.75rem' }}>
        <button style={S.tabBtn(activeTab === 'content')} onClick={() => setActiveTab('content')}>
          <User size={12} /> Contenido
        </button>
        <button style={S.tabBtn(activeTab === 'design')} onClick={() => setActiveTab('design')}>
          <Palette size={12} /> Diseño
        </button>
        <button style={S.tabBtn(activeTab === 'layout')} onClick={() => setActiveTab('layout')}>
          <Layout size={12} /> Diseño Web
        </button>
      </div>

      {/* ── Tab content ───────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

        {/* ════ CONTENT TAB ═══════════════════════════════ */}
        {activeTab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {['staff', 'superadmin'].includes(userRole) && (
            <EditorSection title="Opciones de Staff">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={S.label}>Facción (Shion DB)</label>
                  <select
                    style={S.select}
                    value={character.faction || 'None'}
                    onChange={e => updateField('faction', e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  >
                    <option value="None">Ninguna</option>
                    <option value="Frontier">Frontier</option>
                    <option value="UNION">UNION</option>
                    <option value="ODI">ODI</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Estado del Archivo</label>
                  <select
                    style={S.select}
                    value={character.status || 'w.i.p'}
                    onChange={e => updateField('status', e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  >
                    <option value="w.i.p">W.I.P (En desarrollo)</option>
                    <option value="completed">Completado</option>
                  </select>
                </div>
              </div>
            </EditorSection>
            )}

            <EditorSection title="Identidad">
              {/* Category selector — determines tutor vs student */}
              <div>
                <label style={S.label}>Categoría del Personaje</label>
                <select
                  style={S.select}
                  value={character.character_category || 'student'}
                  onChange={e => updateField('character_category', e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                >
                  <option value="student">Estudiante</option>
                  <option value="tutor">Tutor</option>
                  {(['staff', 'superadmin'].includes(userRole) || character.character_category === 'otros') && (
                    <option value="otros">Otros</option>
                  )}
                </select>
              </div>
              <Field label="Nombre" value={character.name} onChange={v => updateField('name', v)} />
              <Field label="Subtítulo / Título" value={character.subtitle} onChange={v => updateField('subtitle', v)} />
              <ImageUploader label="Imagen del Personaje" value={character.image_url} onChange={v => updateField('image_url', v)} maxSizeMB={5} />
              <div>
                <label style={S.label}>Ajuste de Imagen</label>
                <select
                  style={S.select}
                  value={character.image_fit || 'cover'}
                  onChange={e => updateField('image_fit', e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                >
                  <option value="cover">Cubrir (Cover)</option>
                  <option value="contain">Contener (Contain)</option>
                </select>
              </div>
            </EditorSection>

            <EditorSection title="Estadísticas">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="Edad" value={character.age} onChange={v => updateField('age', v)} />
                <Field label="Altura" value={character.height} onChange={v => updateField('height', v)} />
              </div>
              <Field label="Nacionalidad" value={character.nationality} onChange={v => updateField('nationality', v)} />
            </EditorSection>

            <EditorSection title="Blaze & Elementos">
              <ImageUploader label="Imagen del Blaze" value={character.blaze_image_url || ''} onChange={v => updateField('blaze_image_url', v)} maxSizeMB={5} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="Elemento Usuario" value={character.element_user || ''} onChange={v => updateField('element_user', v)} />
                <Field label="Elemento Blaze" value={character.element_blaze || ''} onChange={v => updateField('element_blaze', v)} />
              </div>
              <Field label="Elemento Avanzado" value={character.element_advanced || ''} onChange={v => updateField('element_advanced', v)} />
              <Field label="Tipo de Blaze" value={character.blaze_type || ''} onChange={v => updateField('blaze_type', v)} />
            </EditorSection>

            {/* Battlefront — hidden for tutors and otros */}
            {!['tutor', 'otros'].includes(character.character_category || 'student') && (
            <EditorSection title="Frente de Batalla">
              <div>
                <label style={S.label}>Nombre del Frente</label>
                <select
                  style={S.select}
                  value={character.battlefront_name || character.clan_name || 'Akatsuki'}
                  onChange={e => updateField('battlefront_name', e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                >
                  <option value="Akatsuki">Akatsuki</option>
                  <option value="Kyomon">Kyomon</option>
                  <option value="Rentei">Rentei</option>
                  <option value="Hagun">Hagun</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Descripción del Frente</label>
                <textarea
                  style={S.textarea}
                  value={character.battlefront_desc || character.clan_desc}
                  onChange={e => updateField('battlefront_desc', e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </EditorSection>
            )}

            <EditorSection title="Datos de Combate">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <RankField label="Poder Ofens." value={character.offensive_power || 'C'} onChange={v => updateField('offensive_power', v)} />
                <RankField label="Poder Defens." value={character.defensive_power || 'C'} onChange={v => updateField('defensive_power', v)} />
                <RankField label="Cantidad Maná" value={character.mana_amount || 'C'} onChange={v => updateField('mana_amount', v)} />
                <RankField label="Control Maná" value={character.mana_control || 'C'} onChange={v => updateField('mana_control', v)} />
                <RankField label="Habilidad Fís." value={character.physical_ability || 'C'} onChange={v => updateField('physical_ability', v)} />
                <RankField label="Suerte" value={character.luck || 'C'} onChange={v => updateField('luck', v)} />
              </div>
            </EditorSection>

            <EditorSection title="Artes Nobles (AN)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(character.noble_arts || []).map((art) => (
                  <div
                    key={art.id}
                    style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--border)', backgroundColor: 'var(--surface-alt)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                  >
                    <button
                      title="Remove"
                      style={{ ...S.iconBtn, position: 'absolute', top: '0.3rem', right: '0.3rem' }}
                      onClick={() => removeNobleArt(art.id)}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                    >
                      <Trash2 size={12} />
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem', paddingRight: '1.5rem' }}>
                      <input style={S.input} placeholder="Nombre del arte" value={art.name} onChange={e => updateNobleArt(art.id, 'name', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                      <input style={S.input} placeholder="Costo" value={art.cost} onChange={e => updateNobleArt(art.id, 'cost', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <textarea style={{ ...S.textarea, minHeight: '52px' }} placeholder="Descripción…" value={art.description} onChange={e => updateNobleArt(art.id, 'description', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                ))}
                <button
                  style={{ ...S.outlineBtn, width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}
                  onClick={addNobleArt}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#0353a4'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#0353a4'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
                >
                  <Plus size={13} /> Agregar Arte Noble
                </button>
              </div>
            </EditorSection>

            <EditorSection title="Personalidad">
              <div>
                <label style={S.label}>Frase / Cita</label>
                <textarea
                  style={{ ...S.textarea, fontStyle: character.quote_italic !== false ? 'italic' : 'normal', fontFamily: character.quote_font || 'var(--font-cormorant)' }}
                  value={character.quote}
                  onChange={e => updateField('quote', e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <div>
                  <label style={S.label}>Fuente de la Cita</label>
                  <select style={S.select} value={character.quote_font || 'var(--font-cormorant)'} onChange={e => updateField('quote_font', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                    {FONTS_HEADING.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                    {FONTS_BODY.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Tamaño de la Cita</label>
                  <select style={S.select} value={character.quote_size || 'text-2xl md:text-3xl'} onChange={e => updateField('quote_size', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                    <option value="text-xl md:text-2xl">Pequeño</option>
                    <option value="text-2xl md:text-3xl">Mediano (Normal)</option>
                    <option value="text-3xl md:text-4xl">Grande</option>
                    <option value="text-4xl md:text-5xl">Extra Grande</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={S.label}>Color (Opcional)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="color" value={character.quote_color || '#ffffff'} onChange={e => updateField('quote_color', e.target.value)} style={{ width: '2.5rem', height: '2.1rem', padding: '0.1rem', cursor: 'pointer', border: '1px solid var(--border)', backgroundColor: 'var(--surface-alt)' }} />
                    <input style={{ ...S.input, flex: 1 }} type="text" placeholder="Heredar color" value={character.quote_color || ''} onChange={e => updateField('quote_color', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                  <label style={S.label}>Cursiva</label>
                  <button
                    role="switch"
                    aria-checked={character.quote_italic !== false}
                    onClick={() => updateField('quote_italic', !(character.quote_italic !== false))}
                    style={{
                      width: '2.4rem', height: '1.3rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
                      backgroundColor: character.quote_italic !== false ? '#0353a4' : 'var(--border)',
                      position: 'relative', transition: 'background-color 0.2s', flexShrink: 0,
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '0.15rem',
                      left: character.quote_italic !== false ? 'calc(100% - 1.05rem)' : '0.15rem',
                      width: '1rem', height: '1rem', borderRadius: '50%', backgroundColor: '#fff',
                      transition: 'left 0.2s', display: 'block',
                    }} />
                  </button>
                </div>
              </div>
            </EditorSection>

          </div>
        )}

        {/* ════ DESIGN TAB ════════════════════════════════ */}
        {activeTab === 'design' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <EditorSection title="Tipografía">
              <div>
                <label style={S.label}>Fuente de Títulos</label>
                <select style={S.select} value={character.font_heading || 'var(--font-cormorant)'} onChange={e => updateField('font_heading', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                  {FONTS_HEADING.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Fuente de Textos</label>
                <select style={S.select} value={character.font_body || 'var(--font-inter)'} onChange={e => updateField('font_body', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                  {FONTS_BODY.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Color del Texto</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="color" value={character.text_color || '#2D2D2D'} onChange={e => updateField('text_color', e.target.value)} style={{ width: '2.5rem', height: '2.1rem', padding: '0.1rem', cursor: 'pointer', border: '1px solid var(--border)', backgroundColor: 'var(--surface-alt)' }} />
                  <input style={{ ...S.input, flex: 1 }} type="text" value={character.text_color || '#2D2D2D'} onChange={e => updateField('text_color', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
            </EditorSection>

            <EditorSection title="Fondo & Marco">
              <div>
                <label style={S.label}>Color de Fondo</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="color" value={character.background_color || '#FFF5F5'} onChange={e => updateField('background_color', e.target.value)} style={{ width: '2.5rem', height: '2.1rem', padding: '0.1rem', cursor: 'pointer', border: '1px solid var(--border)', backgroundColor: 'var(--surface-alt)' }} />
                  <input style={{ ...S.input, flex: 1 }} type="text" value={character.background_color || '#FFF5F5'} onChange={e => updateField('background_color', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              <ImageUploader label="Imagen de Fondo" value={character.background_image_url || ''} onChange={v => updateField('background_image_url', v)} maxSizeMB={5} />

              {character.background_image_url && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <label style={S.label}>Opacidad del Overlay</label>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {Math.round((character.background_overlay_opacity ?? 0.5) * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[character.background_overlay_opacity ?? 0.5]}
                    max={1}
                    step={0.05}
                    onValueChange={vals => updateField('background_overlay_opacity', vals[0] as never)}
                  />
                </div>
              )}

              <div>
                <label style={S.label}>Estilo del Marco</label>
                <select style={S.select} value={character.frame_style || 'ornate'} onChange={e => updateField('frame_style', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                  <option value="ornate">Ornamentado (Normal)</option>
                  <option value="simple">Borde Simple (Grueso)</option>
                  <option value="tech">Tecnológico (Militar)</option>
                  <option value="none">Sin Marco (Mica)</option>
                </select>
              </div>
            </EditorSection>

            {/* ── Info Cards ──────────────────────────── */}
            <EditorSection title="Cajas de Información">
              <div>
                <label style={S.label}>Color de Fondo (Cajas)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="color"
                    value={character.card_bg_color || '#ffffff'}
                    onChange={e => updateField('card_bg_color', e.target.value)}
                    style={{ width: '2.5rem', height: '2.1rem', padding: '0.1rem', cursor: 'pointer', border: '1px solid var(--border)', backgroundColor: 'var(--surface-alt)' }}
                  />
                  <input
                    style={{ ...S.input, flex: 1 }}
                    type="text"
                    value={character.card_bg_color || '#ffffff'}
                    onChange={e => updateField('card_bg_color', e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <label style={S.label}>Opacidad del Fondo</label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {Math.round((character.card_bg_opacity ?? 0.4) * 100)}%
                  </span>
                </div>
                <Slider
                  value={[character.card_bg_opacity ?? 0.4]}
                  max={1}
                  step={0.05}
                  onValueChange={vals => updateField('card_bg_opacity', vals[0] as never)}
                />
              </div>
            </EditorSection>

            {/* ── Blaze Image ─────────────────────────── */}
            <EditorSection title="Imagen del Blaze">
              <div>
                <label style={S.label}>Tamaño del Retrato</label>
                <select
                  style={S.select}
                  value={character.blaze_image_size || 'md'}
                  onChange={e => updateField('blaze_image_size', e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                >
                  <option value="sm">Pequeño</option>
                  <option value="md">Mediano (Normal)</option>
                  <option value="lg">Grande</option>
                  <option value="full">Ancho Completo</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <label style={{ ...S.label, margin: 0 }}>Mostrar Borde y Sombra</label>
                <button
                  role="switch"
                  aria-checked={character.blaze_show_border !== false}
                  onClick={() => updateField('blaze_show_border', !( character.blaze_show_border !== false))}
                  style={{
                    width: '2.4rem',
                    height: '1.3rem',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: character.blaze_show_border !== false ? '#0353a4' : 'var(--border)',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: '0.15rem',
                    left: character.blaze_show_border !== false ? 'calc(100% - 1.05rem)' : '0.15rem',
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    transition: 'left 0.2s',
                    display: 'block',
                  }} />
                </button>
              </div>
            </EditorSection>

            {/* ── ID Card Photo ─────────────────────────── */}
            <EditorSection title="Foto de Identificación (Carnet)">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Imagen que aparecerá en el carnet estudiantil. Si no se especifica, se usa la imagen principal del personaje.
              </p>
              <ImageUploader
                label="Foto del Carnet"
                value={character.id_photo_url || ''}
                onChange={v => updateField('id_photo_url', v)}
                maxSizeMB={5}
                placeholder="https://... (opcional)"
              />
              {/* Preview thumbnail */}
              {(character.id_photo_url || character.image_url) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    flexShrink: 0,
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface-alt)',
                    borderRadius: character.id_photo_border === 'circle' ? '50%' : '0',
                    clipPath: character.id_photo_border === 'hexagon'
                      ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                      : character.id_photo_border === 'diamond'
                      ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                      : 'none',
                    position: 'relative',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={character.id_photo_url || character.image_url}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                    Vista previa del recorte
                  </span>
                </div>
              )}
              <div>
                <label style={S.label}>Forma del Marco</label>
                <select
                  style={S.select}
                  value={character.id_photo_border || 'square'}
                  onChange={e => updateField('id_photo_border', e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                >
                  <option value="square">Cuadrado</option>
                  <option value="circle">Circular</option>
                  <option value="hexagon">Hexagonal</option>
                  <option value="diamond">Diamante</option>
                </select>
              </div>
            </EditorSection>

          </div>
        )}

        {/* ════ LAYOUT TAB ════════════════════════════════ */}
        {activeTab === 'layout' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div style={{ display: 'flex', gap: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
              <button
                style={S.outlineBtn}
                onClick={() => addSection('custom_text')}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#0353a4'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#0353a4'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
              >
                <Type size={12} /> Texto
              </button>
              <button
                style={S.outlineBtn}
                onClick={() => addSection('custom_image')}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#0353a4'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#0353a4'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
              >
                <ImageIcon size={12} /> Imagen
              </button>
              <button
                style={S.outlineBtn}
                onClick={() => addSection('separator')}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#0353a4'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#0353a4'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
              >
                <Minus size={12} /> Separador
              </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={character.layout.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {character.layout.map((section) => (
                    <SortableSectionRow
                      key={section.id}
                      section={section}
                      onRemove={removeSection}
                      onUpdate={updateSection}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

          </div>
        )}
      </div>

      {/* ── Share button ─────────────────────────────────── */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button
          style={S.accentBtn}
          onClick={handleShare}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#023e7d'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0353a4'; }}
        >
          <Share2 size={14} /> Compartir Personaje
        </button>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.62rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--label)',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.35rem',
        marginBottom: '0.75rem',
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <input
        style={S.input}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
}

function RankField({ label, value, onChange }: { label: string; value: Rank; onChange: (v: Rank) => void }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <select style={S.select} value={value} onChange={e => onChange(e.target.value as Rank)} onFocus={onFocus} onBlur={onBlur}>
        {['S', 'A', 'B', 'C', 'D', 'E', 'F'].map(r => <option key={r} value={r}>{r}</option>)}
      </select>
    </div>
  );
}

function SortableSectionRow({ section, onRemove, onUpdate }: { section: Section; onRemove: (id: string) => void; onUpdate: (id: string, u: Partial<Section>) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [expanded, setExpanded] = useState(false);

  const getIcon = () => {
    switch (section.type) {
      case 'stats': return <Type size={13} />;
      case 'blaze': return <ImageIcon size={13} />;
      case 'battlefront': return <Shield size={13} />;
      case 'combat_data': return <Sword size={13} />;
      case 'noble_arts': return <Scroll size={13} />;
      case 'separator': return <Minus size={13} />;
      default: return <Type size={13} />;
    }
  };

  const getLabel = () => {
    switch (section.type) {
      case 'stats': return 'Estadísticas Básicas';
      case 'blaze': return 'Blaze & Elementos';
      case 'battlefront': return 'Frente de Batalla';
      case 'combat_data': return 'Datos de Combate';
      case 'noble_arts': return 'Artes Nobles';
      case 'separator': return 'Separator';
      case 'custom_text': return section.title || 'Custom Text';
      case 'custom_image': return 'Custom Image';
      default: return section.type;
    }
  };

  const isCustom = section.type === 'custom_text' || section.type === 'custom_image' || section.type === 'separator';

  return (
    <div ref={setNodeRef} style={{ ...style, border: '1px solid var(--border)', backgroundColor: 'var(--surface)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.6rem' }}>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-muted)', padding: '0.1rem' }}>
          <GripVertical size={14} />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {getIcon()} {getLabel()}
        </div>
        {isCustom && (
          <button
            style={S.iconBtn}
            onClick={() => setExpanded(!expanded)}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#0353a4'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
        {!section.isCore && (
          <button
            style={S.iconBtn}
            onClick={() => onRemove(section.id)}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {expanded && isCustom && (
        <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface-alt)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {section.type === 'custom_text' && (
            <>
              <input
                style={S.input}
                placeholder="Section title"
                value={section.title || ''}
                onChange={e => onUpdate(section.id, { title: e.target.value })}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <textarea
                style={{ ...S.textarea, minHeight: '70px' }}
                placeholder="Content…"
                value={section.content || ''}
                onChange={e => onUpdate(section.id, { content: e.target.value })}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </>
          )}
          {(section.type === 'custom_image' || section.type === 'separator') && (
            <ImageUploader
              label="URL o Archivo de Imagen"
              value={section.imageUrl || ''}
              onChange={v => onUpdate(section.id, { imageUrl: v })}
              maxSizeMB={5}
              placeholder="https://..."
            />
          )}
        </div>
      )}
    </div>
  );
}
