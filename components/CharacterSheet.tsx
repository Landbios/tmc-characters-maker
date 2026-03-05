'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Character, Section, Rank } from '@/types/character';
import { Zap, Mountain, Shield, Feather, Flame, User, Sword, Scroll, ArrowLeft, Download } from 'lucide-react';
import ImageWithFallback from '@/components/ImageWithFallback';
import { COMBAT_STATS_INFO } from '@/utils/combatStats';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

interface CharacterSheetProps {
  character: Character;
  preview?: boolean;
}

export default function CharacterSheet({ character, preview = false }: CharacterSheetProps) {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);

  const containerStyle = {
    backgroundColor: character.background_color || '#FFF5F5',
    fontFamily: character.font_body || 'var(--font-inter)',
    color: character.text_color || '#2D2D2D',
    '--font-heading': character.font_heading || 'var(--font-cormorant)',
    '--text-color': character.text_color || '#2D2D2D',
  } as React.CSSProperties;

  /* ── Card background helper ──────────────────────────────── */
  const cardBg = (() => {
    const hex = character.card_bg_color || '#ffffff';
    const op  = character.card_bg_opacity ?? 0.4;
    // Parse hex → rgba so opacity is independently controllable
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${op})`;
  })();

  /* ── Blaze image size → aspect + width ──────────────────── */
  const blazeSizeClass = (() => {
    switch (character.blaze_image_size) {
      case 'sm':   return 'aspect-[2/3] max-w-[160px]';
      case 'lg':   return 'aspect-[3/4] max-w-[320px]';
      case 'full': return 'aspect-auto  w-full h-64';
      case 'md':
      default:     return 'aspect-[3/4] max-w-[240px]';
    }
  })();

  const showBlazeBorder = character.blaze_show_border !== false; // default true

  /* ── Section renderer ────────────────────────────────────── */
  const renderSection = (section: Section) => {
    switch (section.type as string) {
      case 'stats':
        return (
          <div key={section.id} className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            <StatBox label="Edad"        value={character.age}         icon={<Feather size={14} />} fontHeading="var(--font-heading)" cardBg={cardBg} />
            <StatBox label="Altura"      value={character.height}      icon={<Shield  size={14} />} fontHeading="var(--font-heading)" cardBg={cardBg} />
            <StatBox label="Nacionalidad" value={character.nationality} icon={<User    size={14} />} fontHeading="var(--font-heading)" cardBg={cardBg} />
          </div>
        );

      case 'blaze':
        return (
          <div key={section.id} className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-6 rounded-2xl"
            style={{ backgroundColor: cardBg }}>
            {/* Left: Blaze Image — size + optional border */}
            <div className={`relative w-full mx-auto overflow-hidden ${blazeSizeClass} ${showBlazeBorder ? 'rounded-xl border border-white/60 shadow-sm' : 'rounded-xl'}`}>
              <ImageWithFallback
                src={character.blaze_image_url || 'https://picsum.photos/seed/fire/400/600'}
                alt="Forma Blaze"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/40 backdrop-blur-sm text-center">
                <span className="text-white/90 text-xs uppercase tracking-widest">Forma Blaze</span>
              </div>
            </div>

            {/* Right: Blaze Stats */}
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl mb-2 text-center md:text-left" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-color)' }}>
                Blaze &amp; Elementos
              </h3>
              <InfoRow icon={<User  size={16} />} label="Elemento Usuario"  value={character.element_user}     fontHeading="var(--font-heading)" cardBg={cardBg} />
              <InfoRow icon={<Flame size={16} />} label="Elemento Blaze"    value={character.element_blaze}    fontHeading="var(--font-heading)" cardBg={cardBg} />
              <InfoRow icon={<Zap   size={16} />} label="Elemento Avanzado" value={character.element_advanced} fontHeading="var(--font-heading)" cardBg={cardBg} />
              <InfoRow icon={<Shield size={16} />} label="Tipo de Blaze"    value={character.blaze_type}       fontHeading="var(--font-heading)" cardBg={cardBg} />
            </div>
          </div>
        );

      case 'battlefront':
      case 'clan':
        if (['tutor', 'otros'].includes(character.character_category || 'student')) return null;
        return (
          <div key={section.id} className="w-full max-w-2xl">
            <div className="rounded-xl p-6 flex flex-col items-center text-center transition-colors duration-300 border border-white/30"
              style={{ backgroundColor: cardBg }}>
              <span className="text-3xl mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-color)' }}>Frente</span>
              <span className="text-xl" style={{ fontFamily: 'var(--font-heading)' }}>{character.battlefront_name || character.clan_name}</span>
              <span className="text-sm opacity-60 mt-2">{character.battlefront_desc || character.clan_desc}</span>
            </div>
          </div>
        );

      case 'combat_data':
        return (
          <div key={section.id} className="w-full max-w-3xl space-y-6">
            <h3 className="text-2xl text-center" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-color)' }}>Datos de Combate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CombatStatBox statKey="offensive_power"  rank={character.offensive_power}  fontHeading="var(--font-heading)" cardBg={cardBg} />
              <CombatStatBox statKey="defensive_power"  rank={character.defensive_power}  fontHeading="var(--font-heading)" cardBg={cardBg} />
              <CombatStatBox statKey="mana_amount"      rank={character.mana_amount}      fontHeading="var(--font-heading)" cardBg={cardBg} />
              <CombatStatBox statKey="mana_control"     rank={character.mana_control}     fontHeading="var(--font-heading)" cardBg={cardBg} />
              <CombatStatBox statKey="physical_ability" rank={character.physical_ability} fontHeading="var(--font-heading)" cardBg={cardBg} />
              <CombatStatBox statKey="luck"             rank={character.luck}             fontHeading="var(--font-heading)" cardBg={cardBg} />
            </div>
          </div>
        );

      case 'noble_arts':
        return (
          <div key={section.id} className="w-full max-w-3xl space-y-6">
            <h3 className="text-2xl text-center" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-color)' }}>Artes Nobles</h3>
            <div className="space-y-4">
              {(character.noble_arts || []).length > 0 ? (
                (character.noble_arts || []).map((art) => (
                  <div key={art.id} className="rounded-xl p-5 border border-white/30 transition-colors" style={{ backgroundColor: cardBg }}>
                    <div className="flex justify-between items-start mb-2 border-b border-current/10 pb-2">
                      <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>{art.name}</span>
                      <span className="text-xs uppercase tracking-wider opacity-70 bg-white/50 px-2 py-1 rounded">{art.cost}</span>
                    </div>
                    <p className="text-sm opacity-80 leading-relaxed whitespace-pre-wrap">{art.description}</p>
                  </div>
                ))
              ) : (
                <div className="text-center opacity-50 text-sm italic py-4">No hay Artes Nobles registradas.</div>
              )}
            </div>
          </div>
        );

      case 'separator':
        return (
          <div key={section.id} className="w-full max-w-2xl py-4 flex justify-center opacity-80">
            {section.imageUrl ? (
              <div className="relative w-full h-12 md:h-16">
                <ImageWithFallback src={section.imageUrl} alt="Separator" fill className="object-contain" />
              </div>
            ) : (
              <div className="flex items-center gap-4 w-full opacity-30">
                <div className="h-px bg-current flex-1" />
                <span className="text-current">❖</span>
                <div className="h-px bg-current flex-1" />
              </div>
            )}
          </div>
        );

      case 'custom_text':
        return (
          <div key={section.id} className="w-full max-w-2xl text-center space-y-2">
            {section.title && (
              <h3 className="text-xl" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-color)' }}>{section.title}</h3>
            )}
            {section.content && (
              <p className="opacity-80 leading-relaxed">{section.content}</p>
            )}
          </div>
        );

      case 'custom_image':
        return (
          <div key={section.id} className="w-full max-w-2xl relative aspect-video rounded-xl overflow-hidden border border-white/50 shadow-sm">
            {section.imageUrl && (
              <ImageWithFallback src={section.imageUrl} alt="Custom" fill className="object-cover" />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getFrameStyles = () => {
    const base = "relative aspect-[16/9] w-full overflow-hidden bg-white/40";
    switch (character.frame_style) {
      case 'simple': return `${base} border-4 border-white/80 shadow-md`;
      case 'tech':   return `${base} border-2 border-white/60 rounded-sm clip-path-tech shadow-lg`;
      case 'none':   return `${base} rounded-2xl shadow-sm`;
      case 'ornate':
      default:       return `${base} rounded-2xl border border-white/50 shadow-sm`;
    }
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto p-8 md:p-12 min-h-screen flex flex-col items-center relative overflow-hidden transition-colors duration-500"
      style={containerStyle}
    >
      {/* Action Buttons */}
      <div className="fixed top-4 left-4 z-50 flex gap-4">
        {isLoggedIn && !preview && (
          <Link href="/dashboard">
            <button
              className="bg-black/60 backdrop-blur border border-white/20 text-white rounded-full p-3 shadow-lg hover:border-blue-400 hover:text-blue-400 transition-all"
              title="Volver al Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
          </Link>
        )}
        {!preview && (
          <Link href={`/character/${character.id}/export`}>
            <button
              className="bg-black/60 backdrop-blur border border-white/20 text-white rounded-full p-3 flex items-center gap-2 shadow-lg hover:border-blue-400 hover:text-blue-400 transition-all"
              title="Imprimir carnet de estudiante"
            >
              <Download size={18} />
              <span className="text-sm font-medium pr-2 hidden sm:inline">Imprimir carnet de estudiante</span>
            </button>
          </Link>
        )}
      </div>

      {/* Background Image & Overlay */}
      {character.background_image_url && (
        <>
          <div className="absolute inset-0 z-0">
            <ImageWithFallback src={character.background_image_url} alt="Background" fill className="object-cover" priority />
          </div>
          <div
            className="absolute inset-0 z-0 transition-opacity duration-300"
            style={{ backgroundColor: character.background_color || '#FFF5F5', opacity: character.background_overlay_opacity ?? 0.8 }}
          />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full flex flex-col items-center gap-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-7xl tracking-wide italic" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-color)' }}>
            {character.name}
          </h1>
          <div className="flex items-center justify-center gap-3 opacity-60 text-sm tracking-[0.2em] uppercase mt-2">
            <span className="text-current">❖</span>
            <span>{character.subtitle}</span>
            <span className="text-current">❖</span>
          </div>
        </div>

        {/* Main Image Frame */}
        <div className="relative p-4 md:p-6 w-full max-w-2xl">
          {character.frame_style === 'ornate' && (
            <>
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-current opacity-40" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-current opacity-40" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-current opacity-40" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-current opacity-40" />
            </>
          )}
          {character.frame_style === 'tech' && (
            <>
              <div className="absolute top-0 left-0 w-16 h-1 bg-current opacity-30" />
              <div className="absolute top-0 left-0 w-1 h-16 bg-current opacity-30" />
              <div className="absolute bottom-0 right-0 w-16 h-1 bg-current opacity-30" />
              <div className="absolute bottom-0 right-0 w-1 h-16 bg-current opacity-30" />
            </>
          )}
          <div className={getFrameStyles()}>
            <ImageWithFallback
              src={character.image_url || 'https://picsum.photos/seed/magic/800/600'}
              alt={character.name}
              fill
              className={character.image_fit === 'contain' ? 'object-contain' : 'object-cover'}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent mix-blend-overlay" />
          </div>
        </div>

        {/* Dynamic Layout Sections */}
        {character.layout && character.layout.map(section => renderSection(section))}

        {/* Footer */}
        <div className="mt-12 text-center space-y-4 opacity-60">
          <div className="flex justify-center gap-2 opacity-50">
            <span className="text-xs">❖</span>
            <span className="text-xs">❖</span>
            <span className="text-xs">❖</span>
          </div>
          <p 
            className={`opacity-80 ${character.quote_size || 'text-2xl md:text-3xl'}`}
            style={{ 
              fontFamily: character.quote_font || 'var(--font-cormorant)',
              fontStyle: character.quote_italic !== false ? 'italic' : 'normal',
              color: character.quote_color || 'inherit'
            }}
          >
            &ldquo;{character.quote}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] opacity-40">
            <span>{character.name}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function StatBox({ label, value, icon, fontHeading, cardBg }: { label: string; value: string; icon: React.ReactNode; fontHeading: string; cardBg: string }) {
  return (
    <div className="rounded-lg p-4 flex flex-col items-center text-center gap-2 transition-colors border border-white/30" style={{ backgroundColor: cardBg }}>
      <div className="opacity-70 mb-1 text-current">{icon}</div>
      <span className="text-[10px] uppercase tracking-widest opacity-50">{label}</span>
      <span className="text-lg font-medium" style={{ fontFamily: fontHeading }}>{value}</span>
    </div>
  );
}

function InfoRow({ icon, label, value, fontHeading, cardBg }: { icon: React.ReactNode; label: string; value: string; fontHeading: string; cardBg: string }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-white/30" style={{ backgroundColor: cardBg }}>
      <div className="text-current opacity-80">{icon}</div>
      <div className="flex-1">
        <span className="block text-[10px] uppercase tracking-widest opacity-50">{label}</span>
        <span className="block text-lg" style={{ fontFamily: fontHeading }}>{value}</span>
      </div>
    </div>
  );
}

function CombatStatBox({ statKey, rank, fontHeading, cardBg }: { statKey: keyof typeof COMBAT_STATS_INFO; rank: Rank; fontHeading: string; cardBg: string }) {
  const info  = COMBAT_STATS_INFO[statKey];
  const value = info.values[rank as Rank] || '-';
  return (
    <div className="rounded-lg p-4 flex flex-col gap-2 transition-colors group relative border border-white/30" style={{ backgroundColor: cardBg }}>
      <div className="flex justify-between items-center border-b border-current/10 pb-2">
        <span className="text-[10px] uppercase tracking-widest opacity-60">{info.label}</span>
        <span className="text-2xl font-bold" style={{ fontFamily: fontHeading }}>{rank}</span>
      </div>
      <div className="text-sm opacity-80 font-medium">{value}</div>
      <div className="absolute left-0 bottom-full mb-2 w-full p-3 bg-black/80 text-white text-xs rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 backdrop-blur-sm">
        {info.description}
      </div>
    </div>
  );
}
