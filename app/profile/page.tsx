'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useRef } from 'react';
import { Character } from '@/types/character';
import { Edit, Trash2, Eye, Plus, LogOut, Download, Upload, Shield, User, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { exportCharacterToJSON, parseCharacterFromJSON, exportCharacterToTupperbox } from '@/utils/characterIO';

interface AuthUser {
  id: string;
  email?: string;
  created_at?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const importRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }
      setUser(authUser as AuthUser);

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Error al cargar tus personajes');
      } else {
        setCharacters(data || []);
      }
      setLoading(false);
    };

    init();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('CONFIRMAR ELIMINACIÓN: Esta acción es irreversible.')) return;
    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar personaje');
    } else {
      setCharacters((prev) => prev.filter((c) => c.id !== id));
      toast.success('Personaje eliminado del sistema');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseCharacterFromJSON(file);
      // Store in sessionStorage so the editor can pre-fill from it
      sessionStorage.setItem('import_character', JSON.stringify(parsed));
      toast.success('Personaje importado. Redirigiendo al editor…');
      router.push('/?import=true');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al importar';
      toast.error(message);
    } finally {
      // Reset the input so the same file can be re-imported
      if (importRef.current) importRef.current.value = '';
    }
  };

  /* ── Styles ─────────────────────────────────────────────── */
  const accentBtnStyle: React.CSSProperties = {
    backgroundColor: '#0353a4',
    color: '#fff',
    border: '1px solid #0353a4',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    padding: '0.45rem 1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  };

  const outlineBtnStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: 'var(--accent)',
    border: '1px solid var(--border)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    padding: '0.45rem 1rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s, color 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  };

  const iconBtnStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    color: 'var(--text-muted)',
    padding: '0.35rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s, border-color 0.2s',
  };

  if (loading) {
    return (
      <div
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
        className="min-h-screen flex flex-col items-center justify-center gap-3"
      >
        <div className="fixed inset-0 grid-overlay pointer-events-none" />
        <Shield style={{ color: 'var(--glow)' }} className="w-10 h-10 animate-pulse" />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} className="text-xs tracking-[0.2em] uppercase animate-pulse">
          Cargando perfil…
        </p>
      </div>
    );
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }} className="min-h-screen relative">
      <div className="fixed inset-0 grid-overlay pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-10">
          <p className="mono-label mb-2" style={{ color: 'var(--glow)' }}>
            ◈ KIZOKU NO YOZAI · PERFIL DE CADETE
          </p>
          <div className="md:flex items-start justify-between flex-wrap gap-4">
            <h1
              style={{
                fontFamily: 'var(--font-cinzel)',
                color: 'var(--text)',
                textShadow: '0 0 24px rgba(59,130,246,0.35)',
                letterSpacing: '0.08em',
              }}
              className="text-4xl font-bold uppercase"
            >
              Mi Perfil
            </h1>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <button
                  style={outlineBtnStyle}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glow)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                  }}
                >
                  ← Character Vault
                </button>
              </Link>
              <button
                style={outlineBtnStyle}
                onClick={handleSignOut}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glow)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                }}
              >
                <LogOut size={13} />
                Cerrar Sesión
              </button>
            </div>
          </div>
          <div className="rule-glow mt-6" />
        </div>

        {/* ── Account Info Card ── */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 0 16px rgba(59,130,246,0.08)',
          }}
          className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 mb-10"
        >
          {/* Avatar placeholder */}
          <div
            style={{
              width: '80px', height: '80px', borderRadius: '50%',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-alt)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <User size={32} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="mono-label" style={{ color: 'var(--glow)' }}>◈ CUENTA DE CADETE</p>
            <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', letterSpacing: '0.06em', color: 'var(--text)' }}>
              {user?.email || '—'}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              MIEMBRO DESDE: {memberSince}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              {characters.length} PERSONAJE{characters.length !== 1 ? 'S' : ''} CREADO{characters.length !== 1 ? 'S' : ''}
            </p>
          </div>
        </div>

        {/* ── My Characters Section ── */}
        <div className="mb-6">
          <div className="md:flex items-center justify-between flex-wrap gap-3 mb-6">
            <div>
              <p className="mono-label" style={{ color: 'var(--glow)' }}>◈ MIS PERSONAJES</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {characters.length} archivo{characters.length !== 1 ? 's' : ''} en tu bóveda personal
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Hidden import input */}
              <input
                ref={importRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
              <button
                style={outlineBtnStyle}
                onClick={() => importRef.current?.click()}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glow)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                }}
              >
                <Upload size={13} />
                Importar JSON
              </button>
              <Link href="/">
                <button
                  style={accentBtnStyle}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#023e7d';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0353a4';
                  }}
                >
                  <Plus size={13} />
                  Nuevo Personaje
                </button>
              </Link>
            </div>
          </div>

          {/* Empty state */}
          {characters.length === 0 ? (
            <div
              style={{
                border: '1px dashed var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-muted)',
              }}
              className="text-center py-20 px-8"
            >
              <Shield style={{ color: 'var(--border)' }} className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="mono-label mb-2" style={{ color: 'var(--text-muted)' }}>
                No has creado personajes aún
              </p>
              <Link href="/">
                <button
                  style={accentBtnStyle}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#023e7d';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0353a4';
                  }}
                >
                  <Plus size={13} />
                  Crear primer personaje
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {characters.map((char) => (
                <div
                  key={char.id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    transition: 'box-shadow 0.25s, transform 0.25s, border-color 0.25s',
                  }}
                  className="overflow-hidden cursor-default"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = '#0353a4';
                    el.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = 'var(--border)';
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Card image */}
                  <div className="relative h-48 w-full">
                    <Image
                      src={char.image_url || 'https://picsum.photos/seed/magic/800/600'}
                      alt={char.name}
                      fill
                      className="object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(3,7,18,0.85) 0%, rgba(14,30,70,0.4) 50%, transparent 100%)',
                      }}
                    />
                    {/* Category badge */}
                    <div
                      className="absolute top-3 right-3"
                      style={{
                        backgroundColor: char.character_category === 'tutor' ? 'rgba(3,83,164,0.85)' : 'rgba(3,7,18,0.7)',
                        border: `1px solid ${char.character_category === 'tutor' ? '#0353a4' : 'var(--border)'}`,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6rem',
                        letterSpacing: '0.1em',
                        color: char.character_category === 'tutor' ? '#fff' : 'var(--glow)',
                        padding: '2px 6px',
                      }}
                    >
                      {char.character_category === 'tutor' ? 'TUTOR' : 'ESTUDIANTE'}
                    </div>
                    {/* Name */}
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
                        {char.name}
                      </h3>
                      {char.subtitle && (
                        <p
                          style={{ fontFamily: 'var(--font-mono)', color: 'rgba(147,197,253,0.85)' }}
                          className="text-[0.65rem] tracking-widest uppercase mt-0.5"
                        >
                          {char.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card footer — all actions (owner guaranteed on this page) */}
                  <div
                    style={{
                      backgroundColor: 'var(--surface-alt)',
                      borderTop: '1px solid var(--border)',
                      padding: '0.6rem 1rem',
                    }}
                    className="flex justify-between items-center"
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {new Date(char.created_at!).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* View */}
                      <Link href={`/character/${char.id}`}>
                        <button
                          title="Ver personaje"
                          style={iconBtnStyle}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                          }}
                        >
                          <Eye size={15} />
                        </button>
                      </Link>

                      {/* Edit */}
                      <Link href={`/?id=${char.id}`}>
                        <button
                          title="Editar personaje"
                          style={iconBtnStyle}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                          }}
                        >
                          <Edit size={15} />
                        </button>
                      </Link>

                      {/* Export JSON */}
                      <button
                        title="Descargar como JSON"
                        style={iconBtnStyle}
                        onClick={() => exportCharacterToJSON(char)}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                        }}
                      >
                        <Download size={15} />
                      </button>

                      {/* Export Tupperbox */}
                      <button
                        title="Exportar a Tupperbox"
                        style={iconBtnStyle}
                        onClick={() => {
                          exportCharacterToTupperbox(char);
                          toast.success('JSON de Tupperbox descargado');
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = '#5865F2';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                        }}
                      >
                        <Share2 size={15} />
                      </button>

                      {/* Delete */}
                      <button
                        title="Eliminar personaje"
                        style={iconBtnStyle}
                        onClick={() => handleDelete(char.id)}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--danger)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
