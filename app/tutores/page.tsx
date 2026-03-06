import { createClient } from '@/utils/supabase/server';
import { Character } from '@/types/character';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Eye } from 'lucide-react';

export const metadata = {
  title: 'Tutores — Kizoku no Yozai',
  description: 'Registro oficial de Tutores de la Academia Kizoku no Yozai.',
};

export default async function TutoresPage() {
  const supabase = await createClient();

  const { data: tutores, error } = await supabase
    .from('characters')
    .select('*')
    .eq('character_category', 'tutor')
    .order('name', { ascending: true });

  if (error) {
    return (
      <div
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
        className="min-h-screen flex items-center justify-center"
      >
        <p className="mono-label" style={{ color: 'var(--danger)' }}>
          Error al cargar el registro de tutores.
        </p>
      </div>
    );
  }

  const list: Character[] = tutores || [];

  return (
    <div
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
      className="min-h-screen relative"
    >
      {/* Dot-grid overlay */}
      <div className="fixed inset-0 grid-overlay pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-10">
          <p className="mono-label mb-2" style={{ color: 'var(--glow)' }}>
            ◈ KIZOKU NO YOZAI · CUERPO DOCENTE
          </p>

          <div className="md:flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-cinzel)',
                  color: 'var(--text)',
                  textShadow: '0 0 24px rgba(59,130,246,0.35)',
                  letterSpacing: '0.08em',
                }}
                className="text-4xl font-bold uppercase"
              >
                Tutores
              </h1>
              <p className="mono-label mt-1" style={{ color: 'var(--text-muted)' }}>
                {list.length} tutor{list.length !== 1 ? 'es' : ''} en el registro
              </p>
            </div>

            <Link href="/dashboard">
              <button
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--accent)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  padding: '0.45rem 1rem',
                  cursor: 'pointer',
                }}
              >
                ← Volver al Vault
              </button>
            </Link>
          </div>

          <div className="rule-glow mt-6" />
        </div>

        {/* ── Empty state ── */}
        {list.length === 0 ? (
          <div
            style={{
              border: '1px dashed var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-muted)',
            }}
            className="text-center py-24 px-8"
          >
            <Shield style={{ color: 'var(--border)' }} className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="mono-label mb-1" style={{ color: 'var(--text-muted)' }}>
              No hay tutores registrados aún
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Los personajes marcados como &quot;tutor&quot; aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((tutor) => (
              <div
                key={tutor.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  transition: 'box-shadow 0.25s, transform 0.25s, border-color 0.25s',
                }}
                className="border border-[var(--border)] overflow-hidden group cursor-default hover:-translate-y-1 hover:border-[#0353a4]"
              >
                {/* Card image */}
                <div className="relative h-48 w-full">
                  <Image
                    src={tutor.image_url || 'https://picsum.photos/seed/tutor/800/600'}
                    alt={tutor.name}
                    fill
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(3,7,18,0.85) 0%, rgba(14,30,70,0.4) 50%, transparent 100%)',
                    }}
                  />
                  {/* Tutor badge */}
                  <div
                    className="absolute top-3 right-3"
                    style={{
                      backgroundColor: 'rgba(3,83,164,0.85)',
                      border: '1px solid #0353a4',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6rem',
                      letterSpacing: '0.1em',
                      color: '#fff',
                      padding: '2px 8px',
                    }}
                  >
                    TUTOR
                  </div>
                  {/* Name overlay */}
                  <div className="absolute bottom-3 left-4">
                    <h3
                      style={{
                        fontFamily: 'var(--font-cinzel)',
                        color: '#fff',
                        letterSpacing: '0.05em',
                        textShadow: '0 0 12px rgba(59,130,246,0.6)',
                      }}
                      className="text-lg font-bold uppercase"
                    >
                      {tutor.name}
                    </h3>
                    {tutor.subtitle && (
                      <p
                        style={{ fontFamily: 'var(--font-mono)', color: 'rgba(147,197,253,0.85)' }}
                        className="text-[0.65rem] tracking-widest uppercase mt-0.5"
                      >
                        {tutor.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card footer */}
                <div
                  style={{
                    backgroundColor: 'var(--surface-alt)',
                    borderTop: '1px solid var(--border)',
                    padding: '0.6rem 1rem',
                  }}
                  className="flex justify-between items-center"
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {tutor.battlefront_name || tutor.element_blaze || '—'}
                  </span>
                  <Link href={`/character/${tutor.id}`}>
                    <button
                      title="Ver personaje"
                      style={{
                        backgroundColor: 'transparent',
                        padding: '0.35rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s, border-color 0.2s'
                      }}
                      className="border border-transparent text-[var(--text-muted)] hover:text-[var(--glow)] hover:border-[var(--border)]"
                    >
                      <Eye size={15} />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
