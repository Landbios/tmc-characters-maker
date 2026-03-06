'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useRef } from 'react';
import { Character } from '@/types/character';
import { Edit, Trash2, Eye, Plus, LogOut, Download, Upload, Shield, User, Share2, CheckSquare, Square, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  exportCharacterToJSON,
  exportCharacterToTupperbox,
  parseCharacterFromJSON,
  exportCharactersToJSON,
  exportCharactersToTupperbox,
} from '@/utils/characterIO';
import { censorEmail } from '@/utils/format';

interface AuthUser {
  id: string;
  email?: string;
  created_at?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<{ id: string; email?: string; role?: string; username?: string; } | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // ── Selection state ──────────────────────────────────────────
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const importRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push('/login'); return; }
      setUser(authUser as AuthUser);

      // Fetch profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        if (profileData.username) {
          setUsernameInput(profileData.username);
        } else if (authUser.email) {
          setUsernameInput(authUser.email);
        }
      }

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) toast.error('Error al cargar tus personajes');
      else setCharacters(data || []);
      setLoading(false);
    };
    init();
  }, [supabase, router]);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !usernameInput.trim()) return;
    
    setIsUpdatingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username: usernameInput.trim() })
      .eq('id', user.id);
      
    setIsUpdatingProfile(false);
    
    if (error) {
      toast.error('Error al actualizar nombre de usuario');
    } else {
      toast.success('Nombre de usuario actualizado con éxito');
      setProfile(prev => prev ? { ...prev, username: usernameInput.trim() } : null);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput || passwordInput !== confirmPasswordInput) {
      toast.error('Las contraseñas no coinciden o están vacías');
      return;
    }
    
    if (passwordInput.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: passwordInput
    });
    
    setIsUpdatingPassword(false);
    
    if (error) {
      toast.error('Error al actualizar contraseña: ' + error.message);
    } else {
      toast.success('Contraseña actualizada con éxito');
      setPasswordInput('');
      setConfirmPasswordInput('');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('CONFIRMAR ELIMINACIÓN: Esta acción es irreversible.')) return;
    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (error) toast.error('Error al eliminar personaje');
    else {
      setCharacters(prev => prev.filter(c => c.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      toast.success('Personaje eliminado del sistema');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseCharacterFromJSON(file);
      sessionStorage.setItem('import_character', JSON.stringify(parsed));
      toast.success('Personaje importado. Redirigiendo al editor…');
      router.push('/?import=true');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al importar');
    } finally {
      if (importRef.current) importRef.current.value = '';
    }
  };

  // ── Selection helpers ──────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(characters.map(c => c.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const selectedCharacters = characters.filter(c => selectedIds.has(c.id));

  const handleBulkJSON = () => {
    if (selectedCharacters.length === 0) { toast.error('Selecciona al menos un personaje'); return; }
    exportCharactersToJSON(selectedCharacters);
    toast.success(`${selectedCharacters.length} personaje(s) exportados como JSON`);
  };

  const handleBulkTupperbox = () => {
    if (selectedCharacters.length === 0) { toast.error('Selecciona al menos un personaje'); return; }
    exportCharactersToTupperbox(selectedCharacters);
    toast.success(`${selectedCharacters.length} personaje(s) exportados a Tupperbox`);
  };

  /* ── Styles ─────────────────────────────────────────────── */
  const accentBtn: React.CSSProperties = {
    backgroundColor: '#0353a4', color: '#fff', border: '1px solid #0353a4',
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.15em',
    textTransform: 'uppercase', padding: '0.45rem 1rem', cursor: 'pointer',
    transition: 'background-color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  };

  const outlineBtn: React.CSSProperties = {
    backgroundColor: 'transparent', color: 'var(--accent)', border: '1px solid var(--border)',
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.15em',
    textTransform: 'uppercase', padding: '0.45rem 1rem', cursor: 'pointer',
    transition: 'border-color 0.2s, color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  };

  const iconBtn: React.CSSProperties = {
    backgroundColor: 'transparent', border: '1px solid transparent', color: 'var(--text-muted)',
    padding: '0.35rem', cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s, border-color 0.2s',
  };

  const hoverGlow = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)';
    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
  };
  const unhoverGlow = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
    (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
  };

  if (loading) return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }} className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="fixed inset-0 grid-overlay pointer-events-none" />
      <Shield style={{ color: 'var(--glow)' }} className="w-10 h-10 animate-pulse" />
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} className="text-xs tracking-[0.2em] uppercase animate-pulse">
        Cargando perfil…
      </p>
    </div>
  );

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }} className="min-h-screen relative">
      <div className="fixed inset-0 grid-overlay pointer-events-none" />

      {/* ── Floating bulk action bar ───────────────────────────── */}
      {selectionMode && (
        <div
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            backgroundColor: 'var(--surface)',
            borderTop: '1px solid #0353a4',
            boxShadow: '0 -4px 32px rgba(3,83,164,0.3)',
            padding: '0.75rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--glow)', letterSpacing: '0.1em' }}>
              {selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''}
            </p>
            <button style={{ ...iconBtn, fontSize: '0.65rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.3rem 0.6rem', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              onClick={selectedIds.size === characters.length ? clearSelection : selectAll}
            >
              {selectedIds.size === characters.length ? 'Deselec. todo' : 'Selec. todo'}
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
            {/* Bulk JSON */}
            <button
              style={{ ...outlineBtn, opacity: selectedIds.size === 0 ? 0.4 : 1 }}
              onClick={handleBulkJSON}
              disabled={selectedIds.size === 0}
              title="Descargar selección como JSON"
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glow)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'; }}
            >
              <Download size={13} /> JSON ({selectedIds.size})
            </button>

            {/* Bulk Tupperbox */}
            <button
              style={{ ...accentBtn, backgroundColor: selectedIds.size === 0 ? 'var(--border)' : '#5865F2', borderColor: selectedIds.size === 0 ? 'var(--border)' : '#5865F2', opacity: selectedIds.size === 0 ? 0.4 : 1 }}
              onClick={handleBulkTupperbox}
              disabled={selectedIds.size === 0}
              title="Exportar selección a Tupperbox"
              onMouseEnter={e => { if (selectedIds.size > 0) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4752c4'; }}
              onMouseLeave={e => { if (selectedIds.size > 0) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5865F2'; }}
            >
              <Share2 size={13} /> Tupperbox ({selectedIds.size})
            </button>

            {/* Exit selection */}
            <button
              style={{ ...iconBtn, padding: '0.45rem' }}
              onClick={exitSelectionMode}
              title="Salir de selección"
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className={`relative z-10 max-w-6xl mx-auto px-6 py-10 ${selectionMode ? 'pb-24' : ''}`}>

        {/* ── Header ── */}
        <div className="mb-10">
          <p className="mono-label mb-2" style={{ color: 'var(--glow)' }}>◈ KIZOKU NO YOZAI · PERFIL DE CADETE</p>
          <div className="md:flex items-start justify-between flex-wrap gap-4">
            <h1 style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text)', textShadow: '0 0 24px rgba(59,130,246,0.35)', letterSpacing: '0.08em' }} className="text-4xl font-bold uppercase">
              Mi Perfil
            </h1>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <button style={outlineBtn}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glow)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'; }}
                >
                  ← Character Vault
                </button>
              </Link>
              <button style={outlineBtn} onClick={handleSignOut}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glow)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'; }}
              >
                <LogOut size={13} /> Cerrar Sesión
              </button>
            </div>
          </div>
          <div className="rule-glow mt-6" />
        </div>

        {/* ── Account Info Card ── */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 0 16px rgba(59,130,246,0.08)' }}
          className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 mb-10"
        >
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '1px solid var(--border)', backgroundColor: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={32} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="mono-label" style={{ color: 'var(--glow)' }}>◈ CUENTA DE CADETE</p>
            <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', letterSpacing: '0.06em', color: 'var(--text)' }}>{profile?.username || censorEmail(user?.email)}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>CORREO: {censorEmail(user?.email)}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>MIEMBRO DESDE: {memberSince}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              {characters.length} PERSONAJE{characters.length !== 1 ? 'S' : ''} CREADO{characters.length !== 1 ? 'S' : ''}
            </p>
          </div>
        </div>

        {/* ── Account Settings ── */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 0 16px rgba(59,130,246,0.08)' }}
          className="p-6 mb-10"
        >
          <p className="mono-label mb-6" style={{ color: 'var(--glow)' }}>◈ AJUSTES DE CUENTA</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Username Update */}
            <form onSubmit={handleUpdateUsername} className="flex flex-col gap-3">
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)', letterSpacing: '0.1em' }}>CAMBIAR RECONOCIMIENTO (NOMBRE DE USUARIO)</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Nuevo nombre de usuario"
                style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.5rem 0.8rem', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                required
              />
              <button
                type="submit"
                disabled={isUpdatingProfile}
                style={{ ...accentBtn, alignSelf: 'flex-start', opacity: isUpdatingProfile ? 0.7 : 1 }}
              >
                {isUpdatingProfile ? 'ACTUALIZANDO...' : 'ACTUALIZAR PERFIL'}
              </button>
            </form>

            {/* Password Update */}
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3">
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)', letterSpacing: '0.1em' }}>ACTUALIZAR CÓDIGO DE ACCESO (CONTRASEÑA)</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Nueva contraseña (min. 6 caracteres)"
                style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.5rem 0.8rem', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                minLength={6}
                required
              />
              <input
                type="password"
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Confirmar nueva contraseña"
                style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.5rem 0.8rem', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                minLength={6}
                required
              />
              <button
                type="submit"
                disabled={isUpdatingPassword}
                style={{ ...accentBtn, alignSelf: 'flex-start', opacity: isUpdatingPassword ? 0.7 : 1 }}
              >
                {isUpdatingPassword ? 'ACTUALIZANDO...' : 'CAMBIAR CÓDIGO'}
              </button>
            </form>
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
              <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

              {/* Bulk select toggle */}
              {characters.length > 0 && (
                <button
                  style={{
                    ...outlineBtn,
                    ...(selectionMode ? { borderColor: '#0353a4', color: '#0353a4' } : {}),
                  }}
                  onClick={() => selectionMode ? exitSelectionMode() : setSelectionMode(true)}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glow)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)'; }}
                  onMouseLeave={e => {
                    if (selectionMode) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#0353a4';
                      (e.currentTarget as HTMLButtonElement).style.color = '#0353a4';
                    } else {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                    }
                  }}
                >
                  <CheckSquare size={13} />
                  {selectionMode ? 'Cancelar selección' : 'Selección múltiple'}
                </button>
              )}

              <button style={outlineBtn} onClick={() => importRef.current?.click()}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glow)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--glow)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'; }}
              >
                <Upload size={13} /> Importar JSON
              </button>
              <Link href="/">
                <button style={accentBtn}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#023e7d'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0353a4'; }}
                >
                  <Plus size={13} /> Nuevo Personaje
                </button>
              </Link>
            </div>
          </div>

          {/* Empty state */}
          {characters.length === 0 ? (
            <div style={{ border: '1px dashed var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-muted)' }} className="text-center py-20 px-8">
              <Shield style={{ color: 'var(--border)' }} className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="mono-label mb-2" style={{ color: 'var(--text-muted)' }}>No has creado personajes aún</p>
              <Link href="/">
                <button style={accentBtn}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#023e7d'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0353a4'; }}
                >
                  <Plus size={13} /> Crear primer personaje
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {characters.map((char) => {
                const isSelected = selectedIds.has(char.id);
                return (
                  <div
                    key={char.id}
                    style={{
                      backgroundColor: 'var(--surface)',
                      border: `1px solid ${isSelected ? '#0353a4' : 'var(--border)'}`,
                      boxShadow: isSelected ? '0 0 0 2px rgba(3,83,164,0.35)' : 'none',
                      transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
                      cursor: selectionMode ? 'pointer' : 'default',
                    }}
                    className="overflow-hidden"
                    onClick={() => { if (selectionMode) toggleSelect(char.id); }}
                    onMouseEnter={e => { if (!selectionMode) { (e.currentTarget as HTMLDivElement).style.borderColor = '#0353a4'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; } }}
                    onMouseLeave={e => { if (!selectionMode) { (e.currentTarget as HTMLDivElement).style.borderColor = isSelected ? '#0353a4' : 'var(--border)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; } }}
                  >
                    {/* Card image */}
                    <div className="relative h-48 w-full">
                      <Image
                        src={char.image_url || 'https://picsum.photos/seed/magic/800/600'}
                        alt={char.name} fill className="object-cover"
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(3,7,18,0.85) 0%, rgba(14,30,70,0.4) 50%, transparent 100%)' }} />

                      {/* ── Checkbox overlay (selection mode) ── */}
                      {selectionMode && (
                        <div className="absolute top-3 left-3 flex items-center justify-center"
                          style={{ width: '24px', height: '24px', backgroundColor: isSelected ? '#0353a4' : 'rgba(3,7,18,0.7)', border: `2px solid ${isSelected ? '#0353a4' : 'rgba(255,255,255,0.5)'}`, borderRadius: '4px', transition: 'all 0.15s' }}
                        >
                          {isSelected && <div style={{ width: '10px', height: '10px', backgroundColor: '#fff', borderRadius: '2px' }} />}
                        </div>
                      )}

                      {/* Category badge */}
                      <div className="absolute top-3 right-3" style={{ backgroundColor: char.character_category === 'tutor' ? 'rgba(3,83,164,0.85)' : 'rgba(3,7,18,0.7)', border: `1px solid ${char.character_category === 'tutor' ? '#0353a4' : 'var(--border)'}`, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: char.character_category === 'tutor' ? '#fff' : 'var(--glow)', padding: '2px 6px' }}>
                        {char.character_category === 'tutor' ? 'TUTOR' : 'ESTUDIANTE'}
                      </div>

                      {/* Name */}
                      <div className="absolute bottom-3 left-4">
                        <h3 style={{ fontFamily: 'var(--font-cinzel)', color: '#fff', letterSpacing: '0.05em', textShadow: '0 0 12px rgba(59,130,246,0.6)' }} className="text-lg font-bold uppercase">{char.name}</h3>
                        {char.subtitle && <p style={{ fontFamily: 'var(--font-mono)', color: 'rgba(147,197,253,0.85)' }} className="text-[0.65rem] tracking-widest uppercase mt-0.5">{char.subtitle}</p>}
                      </div>
                    </div>

                    {/* Card footer */}
                    <div style={{ backgroundColor: 'var(--surface-alt)', borderTop: '1px solid var(--border)', padding: '0.6rem 1rem' }} className="flex justify-between items-center">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {new Date(char.created_at!).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>

                      {/* Action buttons — hidden in selection mode */}
                      {!selectionMode && (
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          {/* View */}
                          <Link href={`/character/${char.id}`}>
                            <button title="Ver personaje" style={iconBtn} onMouseEnter={hoverGlow} onMouseLeave={unhoverGlow}><Eye size={15} /></button>
                          </Link>
                          {/* Edit */}
                          <Link href={`/?id=${char.id}`}>
                            <button title="Editar personaje" style={iconBtn} onMouseEnter={hoverGlow} onMouseLeave={unhoverGlow}><Edit size={15} /></button>
                          </Link>
                          {/* Export JSON */}
                          <button title="Descargar como JSON" style={iconBtn} onClick={() => exportCharacterToJSON(char)} onMouseEnter={hoverGlow} onMouseLeave={unhoverGlow}><Download size={15} /></button>
                          {/* Export Tupperbox */}
                          <button
                            title="Exportar a Tupperbox" style={iconBtn}
                            onClick={() => { exportCharacterToTupperbox(char); toast.success('JSON de Tupperbox descargado'); }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#5865F2'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
                          ><Share2 size={15} /></button>
                          {/* Delete */}
                          <button
                            title="Eliminar personaje" style={iconBtn} onClick={() => handleDelete(char.id)}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--danger)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
                          ><Trash2 size={15} /></button>
                        </div>
                      )}

                      {/* Selection mode indicator */}
                      {selectionMode && (
                        <button
                          style={{ ...iconBtn, color: isSelected ? '#0353a4' : 'var(--text-muted)' }}
                          onClick={e => { e.stopPropagation(); toggleSelect(char.id); }}
                        >
                          {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
