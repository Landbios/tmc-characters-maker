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
    };
    checkUser();
  }, [supabase]);

  useEffect(() => {
    const loadCharacter = async () => {
      if (id) {
        const { data, error } = await supabase.from('characters').select('*').eq('id', id).single();
        if (data && !error) {
          if (!data.layout) {
            data.layout = [
              { id: 'stats', type: 'stats', isCore: true },
              { id: 'blaze', type: 'blaze', isCore: true },
              { id: 'battlefront', type: 'battlefront', isCore: true },
              { id: 'combat_data', type: 'combat_data', isCore: true },
              { id: 'noble_arts', type: 'noble_arts', isCore: true },
            ];
          }
          if (!data.noble_arts) data.noble_arts = [];
          setCharacter(data);
        }
      }
    };
    loadCharacter();
  }, [id, supabase, setCharacter]);

  const handleSave = async () => {
    if (!user) {
      toast.error('Por favor inicia sesión para guardar personajes');
      router.push('/login');
      return;
    }
    setSaving(true);
    try {
      const characterData = { ...character, user_id: (user as { id: string }).id };
      if (characterData.id === 'demo') delete (characterData as Record<string, unknown>).id;
      const { data, error } = await supabase.from('characters').upsert(characterData).select().single();
      if (error) throw error;
      if (data) {
        setCharacter(data);
        toast.success('Character saved!');
        if (!id) router.push(`/?id=${data.id}`);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Save failed: ' + msg);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    if (character.id === 'demo') {
      toast.error('Save your character first to get a share link!');
      return;
    }
    const url = `${window.location.origin}/character/${character.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Public link copied to clipboard!');
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
      title: type === 'custom_text' ? 'New Section' : undefined,
      content: type === 'custom_text' ? 'Add your content here...' : undefined,
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
          Demo mode —{' '}
          <Link href="/login" style={{ color: '#0353a4', textDecoration: 'underline' }}>
            sign in
          </Link>{' '}
          to save characters.
        </div>
      )}

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0, marginTop: '0.75rem' }}>
        <button style={S.tabBtn(activeTab === 'content')} onClick={() => setActiveTab('content')}>
          <User size={12} /> Content
        </button>
        <button style={S.tabBtn(activeTab === 'design')} onClick={() => setActiveTab('design')}>
          <Palette size={12} /> Design
        </button>
        <button style={S.tabBtn(activeTab === 'layout')} onClick={() => setActiveTab('layout')}>
          <Layout size={12} /> Layout
        </button>
      </div>

      {/* ── Tab content ───────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

        {/* ════ CONTENT TAB ═══════════════════════════════ */}
        {activeTab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <EditorSection title="Identity">
              <Field label="Name" value={character.name} onChange={v => updateField('name', v)} />
              <Field label="Subtitle / Title" value={character.subtitle} onChange={v => updateField('subtitle', v)} />
              <Field label="Character Image URL" value={character.image_url} onChange={v => updateField('image_url', v)} placeholder="https://..." />
              <div>
                <label style={S.label}>Image Fit</label>
                <select
                  style={S.select}
                  value={character.image_fit || 'cover'}
                  onChange={e => updateField('image_fit', e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                </select>
              </div>
            </EditorSection>

            <EditorSection title="Stats">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="Age" value={character.age} onChange={v => updateField('age', v)} />
                <Field label="Height" value={character.height} onChange={v => updateField('height', v)} />
              </div>
              <Field label="Nationality" value={character.nationality} onChange={v => updateField('nationality', v)} />
            </EditorSection>

            <EditorSection title="Blaze & Elements">
              <Field label="Blaze Image URL" value={character.blaze_image_url || ''} onChange={v => updateField('blaze_image_url', v)} placeholder="https://..." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="User Element" value={character.element_user || ''} onChange={v => updateField('element_user', v)} />
                <Field label="Blaze Element" value={character.element_blaze || ''} onChange={v => updateField('element_blaze', v)} />
              </div>
              <Field label="Advanced Element" value={character.element_advanced || ''} onChange={v => updateField('element_advanced', v)} />
              <Field label="Blaze Type" value={character.blaze_type || ''} onChange={v => updateField('blaze_type', v)} />
            </EditorSection>

            <EditorSection title="Battlefront">
              <div>
                <label style={S.label}>Battlefront Name</label>
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
                <label style={S.label}>Battlefront Description</label>
                <textarea
                  style={S.textarea}
                  value={character.battlefront_desc || character.clan_desc}
                  onChange={e => updateField('battlefront_desc', e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </EditorSection>

            <EditorSection title="Combat Data">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <RankField label="Off. Power" value={character.offensive_power || 'C'} onChange={v => updateField('offensive_power', v)} />
                <RankField label="Def. Power" value={character.defensive_power || 'C'} onChange={v => updateField('defensive_power', v)} />
                <RankField label="Mana Amount" value={character.mana_amount || 'C'} onChange={v => updateField('mana_amount', v)} />
                <RankField label="Mana Control" value={character.mana_control || 'C'} onChange={v => updateField('mana_control', v)} />
                <RankField label="Physical Ability" value={character.physical_ability || 'C'} onChange={v => updateField('physical_ability', v)} />
                <RankField label="Luck" value={character.luck || 'C'} onChange={v => updateField('luck', v)} />
              </div>
            </EditorSection>

            <EditorSection title="Noble Arts (AN)">
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
                      <input style={S.input} placeholder="Art name" value={art.name} onChange={e => updateNobleArt(art.id, 'name', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                      <input style={S.input} placeholder="Cost" value={art.cost} onChange={e => updateNobleArt(art.id, 'cost', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <textarea style={{ ...S.textarea, minHeight: '52px' }} placeholder="Description…" value={art.description} onChange={e => updateNobleArt(art.id, 'description', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                ))}
                <button
                  style={{ ...S.outlineBtn, width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}
                  onClick={addNobleArt}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#0353a4'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#0353a4'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
                >
                  <Plus size={13} /> Add Noble Art
                </button>
              </div>
            </EditorSection>

            <EditorSection title="Flavor">
              <div>
                <label style={S.label}>Quote</label>
                <textarea
                  style={{ ...S.textarea, fontStyle: 'italic' }}
                  value={character.quote}
                  onChange={e => updateField('quote', e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </EditorSection>

          </div>
        )}

        {/* ════ DESIGN TAB ════════════════════════════════ */}
        {activeTab === 'design' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <EditorSection title="Typography">
              <div>
                <label style={S.label}>Heading Font</label>
                <select style={S.select} value={character.font_heading || 'var(--font-cormorant)'} onChange={e => updateField('font_heading', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                  {FONTS_HEADING.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Body Font</label>
                <select style={S.select} value={character.font_body || 'var(--font-inter)'} onChange={e => updateField('font_body', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                  {FONTS_BODY.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Text Color</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="color" value={character.text_color || '#2D2D2D'} onChange={e => updateField('text_color', e.target.value)} style={{ width: '2.5rem', height: '2.1rem', padding: '0.1rem', cursor: 'pointer', border: '1px solid var(--border)', backgroundColor: 'var(--surface-alt)' }} />
                  <input style={{ ...S.input, flex: 1 }} type="text" value={character.text_color || '#2D2D2D'} onChange={e => updateField('text_color', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
            </EditorSection>

            <EditorSection title="Background & Frame">
              <div>
                <label style={S.label}>Background Color</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="color" value={character.background_color || '#FFF5F5'} onChange={e => updateField('background_color', e.target.value)} style={{ width: '2.5rem', height: '2.1rem', padding: '0.1rem', cursor: 'pointer', border: '1px solid var(--border)', backgroundColor: 'var(--surface-alt)' }} />
                  <input style={{ ...S.input, flex: 1 }} type="text" value={character.background_color || '#FFF5F5'} onChange={e => updateField('background_color', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              <Field label="Background Image URL" value={character.background_image_url || ''} onChange={v => updateField('background_image_url', v)} placeholder="https://..." />

              {character.background_image_url && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <label style={S.label}>Overlay Opacity</label>
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
                <label style={S.label}>Frame Style</label>
                <select style={S.select} value={character.frame_style || 'ornate'} onChange={e => updateField('frame_style', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                  <option value="ornate">Ornate (Default)</option>
                  <option value="simple">Simple Border</option>
                  <option value="tech">Tech / Modern</option>
                  <option value="none">None (Rounded)</option>
                </select>
              </div>
            </EditorSection>

            {/* ── Info Cards ──────────────────────────── */}
            <EditorSection title="Info Cards">
              <div>
                <label style={S.label}>Card Background Color</label>
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
                  <label style={S.label}>Card Opacity</label>
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
            <EditorSection title="Blaze Image">
              <div>
                <label style={S.label}>Portrait Size</label>
                <select
                  style={S.select}
                  value={character.blaze_image_size || 'md'}
                  onChange={e => updateField('blaze_image_size', e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium (default)</option>
                  <option value="lg">Large</option>
                  <option value="full">Full width</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <label style={{ ...S.label, margin: 0 }}>Show Border &amp; Shadow</label>
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
                <Type size={12} /> Text
              </button>
              <button
                style={S.outlineBtn}
                onClick={() => addSection('custom_image')}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#0353a4'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#0353a4'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
              >
                <ImageIcon size={12} /> Image
              </button>
              <button
                style={S.outlineBtn}
                onClick={() => addSection('separator')}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#0353a4'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#0353a4'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
              >
                <Minus size={12} /> Separator
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
          <Share2 size={14} /> Share Character
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
      case 'stats': return 'Basic Stats';
      case 'blaze': return 'Blaze & Elements';
      case 'battlefront': return 'Battlefront';
      case 'combat_data': return 'Combat Data';
      case 'noble_arts': return 'Noble Arts';
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
            <input
              style={S.input}
              placeholder="Image URL"
              value={section.imageUrl || ''}
              onChange={e => onUpdate(section.id, { imageUrl: e.target.value })}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          )}
        </div>
      )}
    </div>
  );
}
