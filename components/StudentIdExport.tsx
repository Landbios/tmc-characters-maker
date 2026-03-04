'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Character } from '@/types/character';
// Nota: ImageWithFallback ya no se usa dentro del área de captura para evitar errores
import ImageWithFallback from '@/components/ImageWithFallback'; 
import html2canvas from 'html2canvas-oklch';
import { jsPDF } from 'jspdf';
import { Shield } from 'lucide-react';
import { COMBAT_STATS_INFO } from '@/utils/combatStats';

interface StudentIdExportProps {
  character: Character;
}

export default function StudentIdExport({ character }: StudentIdExportProps) {
  const router = useRouter();
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string>('Inicializando sistemas...');
  const [dots, setDots] = useState('');
  
  // Estados para almacenar las versiones Base64 de TODAS las imágenes
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [bgDataUrl, setBgDataUrl] = useState<string>('');
  const [blazeDataUrl, setBlazeDataUrl] = useState<string>('');

  // Animación de los puntos
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const generatePDF = async () => {
      if (!hiddenRef.current) return;

      try {
        setStatus('Cargando recursos visuales');

        // Función robusta para obtener Base64 usando tu Proxy
        const getBase64 = async (url: string): Promise<string> => {
          if (!url) return '';
          if (url.startsWith('data:')) return url;

          try {
            // 1. Intentamos pasar por el proxy para evitar CORS (especialmente Pinterest)
            // Asegúrate de haber creado app/api/proxy/route.ts como hablamos
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
            const res = await fetch(proxyUrl);
            
            if (!res.ok) throw new Error('Proxy failed');

            const blob = await res.blob();
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (err) {
            console.error("Error cargando imagen (proxy):", url, err);
            // Si falla el proxy, devolvemos la URL original para intentar carga directa
            // (aunque probablemente falle si es CORS estricto)
            return url; 
          }
        };

        // Cargamos las 3 imágenes principales en paralelo
        const [photoBase64, bgBase64, blazeBase64] = await Promise.all([
          getBase64(character.id_photo_url || character.image_url || ''),
          getBase64(character.background_image_url || ''),
          getBase64(character.blaze_image_url || '')
        ]);

        // Guardamos en el estado para que el DOM se actualice
        setPhotoDataUrl(photoBase64);
        setBgDataUrl(bgBase64);
        setBlazeDataUrl(blazeBase64);

        setStatus('Sintetizando credencial');
        
        // CRÍTICO: Esperar a que React "pinte" las imágenes Base64 en el DOM
        await new Promise(resolve => setTimeout(resolve, 800));

        const element = hiddenRef.current;
        
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: false, // IMPORTANTE: false para permitir exportar
          backgroundColor: character.background_color || '#0a0f1e',
          logging: true,
          // Eliminamos onclone complejo, ya no es necesario con Base64
        });

        setStatus('Procesando datos PDF');
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdfWidth = canvas.width / 2;
        const pdfHeight = canvas.height / 2;

        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [pdfWidth, pdfHeight]
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${character.name.replace(/\s+/g, '_')}_carnet.pdf`);

        setStatus('Generación completada');
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.back();

      } catch (error) {
        console.error('Error generating PDF:', error);
        setStatus('Error en generación');
        await new Promise(resolve => setTimeout(resolve, 3000));
        router.back();
      }
    };

    generatePDF();
  }, [character, router]);

  // --- Derived colors ---
  const bg        = character.background_color || '#0a0f1e';
  const textColor = character.text_color || '#e8e8f0';
  const accent      = textColor;
  const accentFaint   = `${accent}1a`;
  const accentMid     = `${accent}33`;
  const accentLine    = `${accent}66`;
  const accentGlow    = `${accent}aa`;
  const accentSolid   = accent;
  const dimText       = `${textColor}99`;
  const subtleText    = `${textColor}55`;

  const cardBgRaw    = character.card_bg_color || '#ffffff';
  const cardBgOpacity = character.card_bg_opacity ?? 0.15;
  
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const boxBg = cardBgRaw.startsWith('#') ? hexToRgba(cardBgRaw, cardBgOpacity) : `${cardBgRaw}`;

  const studentId     = `KNZ-${character.id.split('-')[0].slice(0,8).toUpperCase()}`;
  const expireDate    = new Date();
  expireDate.setFullYear(expireDate.getFullYear() + 4);
  const expireStr     = expireDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fontHeading   = character.font_heading || 'var(--font-cormorant)';

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--bg, #030712)', color: 'var(--text, #e2e8f0)' }}>

      {/* Loading UI */}
      <div className="fixed inset-0 grid-overlay pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <Shield style={{ color: 'var(--glow, #3b82f6)' }} className="w-12 h-12 animate-pulse" />
        <div className="text-center">
          <p style={{ color: 'var(--glow, #3b82f6)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.2em' }} className="text-sm uppercase animate-pulse mb-2">
            Generando Carnet Estudiantil
          </p>
          <p style={{ color: 'var(--text-muted, #94a3b8)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.15em' }} className="text-xs uppercase animate-pulse">
            {status}{dots}
          </p>
        </div>
      </div>

      {/* ── HIDDEN EXPORT TEMPLATE ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', zIndex: -1, overflow: 'hidden', width: '1280px', height: '720px' }}>
        <div
          ref={hiddenRef}
          style={{
            width: '1280px', height: '720px', backgroundColor: bg, color: textColor,
            fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Background Image: Usamos <img> estándar con el Base64 */}
          {(bgDataUrl || character.background_image_url) && (
            <>
              <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={bgDataUrl || character.background_image_url} 
                  alt="bg" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  crossOrigin="anonymous"
                />
              </div>
              <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: bg, opacity: Math.min((character.background_overlay_opacity ?? 0.85), 0.92) }} />
            </>
          )}

          {/* Lines */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, ${accentGlow}, transparent)`, zIndex: 2 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, ${accentGlow}, transparent)`, zIndex: 2 }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '3px', background: `linear-gradient(180deg, transparent, ${accentLine}, transparent)`, zIndex: 2 }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '3px', background: `linear-gradient(180deg, transparent, ${accentLine}, transparent)`, zIndex: 2 }} />

          {/* Main content */}
          <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', height: '100%', padding: '32px 40px' }}>

            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${accentLine}` }}>
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.4em', color: subtleText, marginBottom: '6px', textTransform: 'uppercase' }}>
                  Identificación Oficial — Academia Kizoku no Yozai
                </div>
                <h1 style={{ fontSize: '38px', fontFamily: fontHeading, letterSpacing: '0.08em', margin: 0, lineHeight: 1.1, color: textColor }}>
                  {character.name}
                </h1>
                <div style={{ fontSize: '14px', letterSpacing: '0.25em', color: accentSolid, marginTop: '4px', textTransform: 'uppercase' }}>
                  {character.subtitle || 'Estudiante'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.3em', color: subtleText, textTransform: 'uppercase', marginBottom: '4px' }}>ID Estudiante</div>
                <div style={{ fontFamily: 'monospace', fontSize: '16px', color: accentGlow, letterSpacing: '0.1em' }}>{studentId}</div>
                <div style={{ fontSize: '10px', color: subtleText, marginTop: '4px', letterSpacing: '0.2em' }}>Válido hasta {expireStr}</div>
              </div>
            </div>

            {/* ── BODY ── */}
            <div style={{ display: 'flex', gap: '32px', flex: 1, overflow: 'hidden' }}>

              {/* COL 1 – Portrait */}
              {(() => {
                const photoSrc = photoDataUrl || character.id_photo_url || character.image_url || 'https://picsum.photos/seed/character/600/600';
                const borderShape = character.id_photo_border || 'square';
                const isCircle = borderShape === 'circle';
                const photoRadius = isCircle ? '50%' : borderShape === 'hexagon' ? '16px' : borderShape === 'diamond' ? '8px' : '0';

                return (
                  <div style={{ width: '250px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '254px', height: '254px', borderRadius: photoRadius, padding: '2px',
                      background: `linear-gradient(135deg, ${accentLine} 0%, transparent 50%, ${accentLine} 100%)`, flexShrink: 0,
                    }}>
                      <div style={{
                        width: '250px', height: '250px', borderRadius: photoRadius, overflow: 'hidden',
                        position: 'relative', backgroundColor: `${bg}aa`,
                      }}>
                        {/* Marks */}
                        {!isCircle && ([['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']] as const).map(([v, h]) => (
                          <div key={`${v}${h}`} style={{
                            position: 'absolute', [v]: '2px', [h]: '2px', width: '18px', height: '18px', zIndex: 10,
                            borderTop: v === 'top' ? `2px solid ${accentSolid}` : 'none',
                            borderBottom: v === 'bottom' ? `2px solid ${accentSolid}` : 'none',
                            borderLeft: h === 'left' ? `2px solid ${accentSolid}` : 'none',
                            borderRight: h === 'right' ? `2px solid ${accentSolid}` : 'none',
                          }} />
                        ))}
                        
                        {/* Main Portrait Image - Standard IMG */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoSrc}
                          alt={character.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          crossOrigin="anonymous"
                        />
                        
                        {!isCircle && (
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px', background: `linear-gradient(transparent, ${bg})`, zIndex: 5 }} />
                        )}
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${accentLine}, transparent)`, zIndex: 6, opacity: 0.4 }} />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* COL 2 – Info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.35em', color: accentSolid, textTransform: 'uppercase', marginBottom: '16px' }}>Datos Personales</div>
                {[
                  { label: 'Nombre Completo', value: character.name },
                  { label: 'Nacionalidad', value: character.nationality || '—' },
                  { label: 'Edad', value: character.age || '—' },
                  { label: 'Altura', value: character.height || '—' },
                  { label: 'Frente / Escuadrón', value: character.battlefront_name || character.clan_name || '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', paddingBottom: '14px', marginBottom: '14px', borderBottom: `1px solid ${accentFaint}` }}>
                    <span style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: subtleText, marginBottom: '4px' }}>{label}</span>
                    <span style={{ fontSize: '20px', fontFamily: fontHeading, letterSpacing: '0.06em', textTransform: 'uppercase', color: textColor }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* COL 3 – Blaze */}
              <div style={{ width: '460px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.35em', color: accentSolid, textTransform: 'uppercase', marginBottom: '16px' }}>Datos de Combate & Blaze</div>

                <div style={{
                  display: 'flex', gap: '20px', alignItems: 'center', padding: '16px', marginBottom: '16px',
                  border: `1px solid ${accentMid}`, backgroundColor: boxBg, borderRadius: '8px'
                }}>
                  <div style={{ width: '80px', height: '80px', flexShrink: 0, position: 'relative', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${accentLine}` }}>
                    {/* Blaze Image: Standard IMG with Base64 */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blazeDataUrl || character.blaze_image_url || 'https://picsum.photos/seed/blaze/200/200'}
                      alt="Blaze"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', letterSpacing: '0.3em', color: subtleText, textTransform: 'uppercase', marginBottom: '4px' }}>
                      Blaze ({character.blaze_type || '—'})
                    </div>
                    <div style={{ fontSize: '20px', fontFamily: fontHeading, textTransform: 'uppercase', color: textColor }}>{character.element_blaze || '—'}</div>
                    <div style={{ fontSize: '11px', color: dimText, marginTop: '4px', letterSpacing: '0.12em' }}>
                      {[character.element_user, character.element_advanced].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {(['offensive_power', 'defensive_power', 'mana_amount', 'mana_control', 'physical_ability', 'luck'] as const).map((statKey) => {
                    const info = COMBAT_STATS_INFO[statKey];
                    const rank = character[statKey as keyof Character] as any || '-';
                    const valueStr = info.values[rank as keyof typeof info.values] || '-';
                    return (
                      <div key={statKey} style={{
                        display: 'flex', flexDirection: 'column', padding: '12px 14px',
                        border: `1px solid ${accentMid}`, backgroundColor: boxBg, borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: subtleText }}>{info.label}</span>
                          <span style={{ fontSize: '20px', fontFamily: fontHeading, fontWeight: 700, color: textColor }}>{rank}</span>
                        </div>
                        <div style={{ height: '1px', backgroundColor: accentFaint, marginBottom: '8px' }} />
                        <div style={{ fontSize: '11px', color: textColor, opacity: 0.9 }}>
                          {valueStr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${accentLine}`, textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontFamily: fontHeading, fontStyle: 'italic', letterSpacing: '0.12em', color: dimText }}>
                &quot;{character.quote ? character.quote.replace(/^[""""]|[""""]$/g, '') : 'Academia Kizoku no Yozai'}&quot;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}