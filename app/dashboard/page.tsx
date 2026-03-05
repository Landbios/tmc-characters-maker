'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Character } from '@/types/character';
import { Edit, Trash2, Eye, Plus, LogOut, Search, ChevronLeft, ChevronRight, Shield, MessageSquarePlus, X, Send, UserCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import React from 'react';

const ITEMS_PER_PAGE = 6;

export default function DashboardPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBattlefront, setFilterBattlefront] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [userRole, setUserRole] = useState<'roleplayer' | 'staff' | 'superadmin'>('roleplayer');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchCharacters = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user as { id: string });

      // Fetch user role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile && profile.role) {
        setUserRole(profile.role);
      }

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Error al cargar personajes');
      } else {
        setCharacters(data || []);
      }
      setLoading(false);
    };

    fetchCharacters();
  }, [supabase, router]);

  const handleFeedbackSubmit = async () => {
    const trimmed = feedbackText.trim();
    if (!trimmed || !currentUser) return;
    setFeedbackSubmitting(true);
    const { error } = await supabase
      .from('feedback')
      .insert({ user_id: currentUser.id, content: trimmed });
    setFeedbackSubmitting(false);
    if (error) {
      toast.error('Error al enviar tus sugerencias. Intenta nuevamente.');
    } else {
      toast.success('Comentarios recibidos — ¡gracias!');
      setFeedbackText('');
      setFeedbackOpen(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDelete = async (id: string) => {
    const charToDelete = characters.find(c => c.id === id);
    if (!currentUser || charToDelete?.user_id !== currentUser.id) {
      toast.error('Acceso denegado — no tienes permiso para eliminar este personaje.');
      return;
    }
    if (!confirm('CONFIRMAR ELIMINACIÓN: Esta acción es irreversible.')) return;
    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar personaje');
    } else {
      setCharacters(characters.filter(c => c.id !== id));
      toast.success('Archivo de personaje purgado del sistema');
    }
  };

  if (loading) {
    return (
      <div
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
        className="min-h-screen flex flex-col items-center justify-center gap-3"
      >
        {/* Dot grid overlay */}
        <div className="fixed inset-0 grid-overlay pointer-events-none" />
        <Shield style={{ color: 'var(--glow)' }} className="w-10 h-10 animate-pulse" />
        <p
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          className="text-xs tracking-[0.2em] uppercase animate-pulse"
        >
          Autenticando — por favor espere…
        </p>
      </div>
    );
  }

  /* ── Derived State ─────────────────────────────────────── */
  const filteredCharacters = characters.filter((c) => {
    // No mostrar los W.I.P en el dashboard público
    if (c.status === 'w.i.p') return false;

    const t = searchTerm.toLowerCase();
    const textMatch = !searchTerm || [c.name, c.subtitle, c.quote].some(f => f && f.toLowerCase().includes(t));
    const bf = c.battlefront_name || c.clan_name;
    const filterMatch = !filterBattlefront || bf === filterBattlefront;
    return textMatch && filterMatch;
  });

  const sortedCharacters = [...filteredCharacters].sort((a, b) => a.name?.localeCompare(b.name || '') || 0);
  const totalPages = Math.ceil(sortedCharacters.length / ITEMS_PER_PAGE);
  const paginatedCharacters = sortedCharacters.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ── Shared inline styles ──────────────────────────────── */
  const surfaceStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  };

  const accentBtnStyle: React.CSSProperties = {
    backgroundColor: '#0353a4',
    color: '#fff',
    border: '1px solid #0353a4',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    padding: '0.45rem 1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const outlineBtnStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: 'var(--accent)',
    border: '1px solid var(--border)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    padding: '0.45rem 1rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s, color 0.2s',
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

  return (
    <div
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
      className="min-h-screen relative"
    >
      {/* ── Dot-grid background overlay ───────────────── */}
      <div className="fixed inset-0 grid-overlay pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* ── Header ──────────────────────────────────── */}
        <div className="mb-10">
          <p className="mono-label mb-2" style={{ color: 'var(--glow)' }}>
            ◈ KIZOKU NO YOZAI · CLASIFICACIÓN: CADETE
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
                Character Vault
              </h1>
              <p className="mono-label mt-1" style={{ color: 'var(--text-muted)' }}>
                {characters.length} archivo{characters.length !== 1 ? 's' : ''} en el registro
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center flex-wrap gap-3">
              {/* Tutores */}
              <Link href="/tutores">
                <button
                  style={outlineBtnStyle}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glow)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                  }}
                >
                  <Users className="inline mr-2 h-3.5 w-3.5" />
                  Tutores
                </button>
              </Link>
              
              {userRole === 'superadmin' && (
                <Link href="/admin">
                  <button
                    style={{ ...outlineBtnStyle, borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <Shield className="inline mr-2 h-3.5 w-3.5" />
                    Admin Panel
                  </button>
                </Link>
              )}
              
              {['staff', 'superadmin'].includes(userRole) && (
                <Link href="/shion-db">
                  <button
                    style={{
                      ...outlineBtnStyle,
                      position: 'relative',
                      overflow: 'hidden',
                      color: '#22c55e', // matrix green
                      borderColor: '#22c55e',
                    }}
                    className="group"
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                      (e.currentTarget as HTMLButtonElement).style.textShadow = '0 0 8px rgba(34, 197, 94, 0.8)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.textShadow = 'none';
                    }}
                  >
                    {/* Glitch effect layer */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 mix-blend-screen pointer-events-none transition-opacity duration-75 text-[0.5rem] leading-[0.5rem] break-all overflow-hidden text-green-500 font-mono tracking-tighter" style={{ zIndex: 0 }}>
                      01010110100101001011000100110101100100
                    </div>
                    <Eye className="inline mr-2 h-3.5 w-3.5 relative z-10" />
                    <span className="relative z-10 uppercase font-black" style={{ letterSpacing: '0.2em' }}>Shion DB</span>
                  </button>
                </Link>
              )}

              {/* Profile */}
              <Link href="/profile">
                <button
                  style={outlineBtnStyle}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glow)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                  }}
                >
                  <UserCircle className="inline mr-2 h-3.5 w-3.5" />
                  Mi Perfil
                </button>
              </Link>
              {/* Feedback button */}
              <button
                title="Dejar sugerencias o feedback"
                style={outlineBtnStyle}
                onClick={() => setFeedbackOpen(true)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glow)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                }}
              >
                <MessageSquarePlus className="inline mr-2 h-3.5 w-3.5" />
                Sugerencias
              </button>
              <button
                style={outlineBtnStyle}
                onClick={handleSignOut}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glow)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                }}
              >
                <LogOut className="inline mr-2 h-3.5 w-3.5" />
                Cerrar Sesión
              </button>
              <Link href="/">
                <button
                  style={accentBtnStyle}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#023e7d';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0353a4';
                  }}
                >
                  <Plus className="inline mr-2 h-3.5 w-3.5" />
                  Nuevo Personaje
                </button>
              </Link>
            </div>
          </div>

          {/* Section divider with glow */}
          <div className="rule-glow mt-6" />
        </div>

        {/* ── Empty state ─────────────────────────────── */}
        {characters.length === 0 ? (
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
              No se encontraron registros en la bóveda
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Aún no has reclutado ningún personaje.
            </p>
            <Link href="/">
              <button
                style={accentBtnStyle}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#023e7d';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0353a4';
                }}
              >
                <Plus className="inline mr-2 h-3.5 w-3.5" />
                Reclutar primer personaje
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Search / Filter bar ─────────────────── */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 0 12px rgba(59,130,246,0.08)',
              }}
              className="flex flex-col md:flex-row gap-3 p-4"
            >
              {/* Search */}
              <div className="flex-1 relative">
                <Search
                  style={{ color: 'var(--text-muted)' }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                />
                <input
                  type="text"
                  placeholder="Buscar archivos por nombre, título, cita…"
                  style={{
                    backgroundColor: 'var(--surface-alt)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    outline: 'none',
                  }}
                  className="w-full pl-10 pr-4 py-2 transition-colors"
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--glow)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>

              {/* Filter */}
              <div className="w-full md:w-56">
                <select
                  style={{
                    backgroundColor: 'var(--surface-alt)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    outline: 'none',
                  }}
                  className="w-full px-3 py-2 appearance-none transition-colors"
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--glow)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                  value={filterBattlefront}
                  onChange={e => { setFilterBattlefront(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">Todos los Frentes</option>
                  {Array.from(new Set(characters.map(c => c.battlefront_name || c.clan_name).filter(Boolean))).map(bf => (
                    <option key={bf} value={bf}>{bf}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Character Grid ──────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedCharacters.map((char) => (
                <div
                  key={char.id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    transition: 'box-shadow 0.25s, transform 0.25s, border-color 0.25s',
                  }}
                  className="overflow-hidden group cursor-default"
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = '#0353a4';
                    el.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
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
                    {/* Blue-tinted gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(3,7,18,0.85) 0%, rgba(14,30,70,0.4) 50%, transparent 100%)',
                      }}
                    />
                    {/* Classification badge top-right */}
                    <div
                      className="absolute top-3 right-3"
                      style={{
                        backgroundColor: 'rgba(3,7,18,0.7)',
                        border: '1px solid var(--border)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6rem',
                        letterSpacing: '0.1em',
                        color: 'var(--glow)',
                        padding: '2px 6px',
                      }}
                    >
                      ARCHIVO
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

                  {/* Card footer */}
                  <div
                    style={{
                      backgroundColor: 'var(--surface-alt)',
                      borderTop: '1px solid var(--border)',
                      padding: '0.6rem 1rem',
                    }}
                    className="flex justify-between items-center"
                  >
                    <span
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}
                    >
                      {new Date(char.created_at!).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>

                    {/* Action icons */}
                    <div className="flex items-center gap-1">
                      <Link href={`/character/${char.id}`}>
                        <button
                          title="Ver personaje"
                          style={iconBtnStyle}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                          }}
                        >
                          <Eye size={15} />
                        </button>
                      </Link>

                      {currentUser?.id === char.user_id && (
                        <>
                          <Link href={`/?id=${char.id}`}>
                            <button
                              title="Editar personaje"
                              style={iconBtnStyle}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                              }}
                            >
                              <Edit size={15} />
                            </button>
                          </Link>
                          <button
                            title="Eliminar personaje"
                            style={{ ...iconBtnStyle }}
                            onClick={() => handleDelete(char.id)}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)';
                              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--danger)';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                              (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── No results ──────────────────────────── */}
            {paginatedCharacters.length === 0 && (
              <div
                className="text-center py-12"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}
              >
                ◈ NO HAY REGISTROS QUE COINCIDAN CON LOS CRITERIOS
              </div>
            )}

            {/* ── Pagination ──────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    padding: '0.5rem 1.25rem',
                  }}
                >
                  <button
                    style={{
                      ...iconBtnStyle,
                      opacity: currentPage === 1 ? 0.3 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    onMouseEnter={e => {
                      if (currentPage !== 1) (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--text-muted)' }}
                  >
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    style={{
                      ...iconBtnStyle,
                      opacity: currentPage === totalPages ? 0.3 : 1,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    onMouseEnter={e => {
                      if (currentPage !== totalPages) (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ── Feedback Modal ──────────────────────────────── */}
      {feedbackOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setFeedbackOpen(false); }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              width: '100%',
              maxWidth: '480px',
            }}
            className="relative flex flex-col gap-0"
          >
            {/* Modal header */}
            <div style={{ borderBottom: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--surface-alt)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--glow)' }}>
                ◈ Enviar Sugerencia
              </span>
              <button
                onClick={() => setFeedbackOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem', display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                Comparte tus sugerencias, reportes de bugs o ideas para mejorar la plataforma de Personajes.
              </p>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value.slice(0, 1000))}
                maxLength={1000}
                rows={6}
                placeholder="Tu mensaje aquí…"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--surface-alt)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  padding: '0.6rem 0.75rem',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '120px',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0353a4')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                  {feedbackText.length} / 1000
                </span>
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedbackText.trim() || feedbackSubmitting}
                  style={{
                    backgroundColor: !feedbackText.trim() || feedbackSubmitting ? 'var(--border)' : '#0353a4',
                    color: '#fff',
                    border: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '0.5rem 1.25rem',
                    cursor: !feedbackText.trim() || feedbackSubmitting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (feedbackText.trim() && !feedbackSubmitting)
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#023e7d';
                  }}
                  onMouseLeave={e => {
                    if (feedbackText.trim() && !feedbackSubmitting)
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0353a4';
                  }}
                >
                  <Send size={13} />
                  {feedbackSubmitting ? 'Enviando…' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
