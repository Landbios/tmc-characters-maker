'use client';

import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, LogIn, UserPlus, ChevronRight } from 'lucide-react';
import { Suspense } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'auth_callback_failed') {
      toast.error('Email confirmation failed. Please try again.');
    }
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { username: username || email.split('@')[0] },
          },
        });
        if (error) throw error;
        setEmailSent(true);
        toast.success('Confirmation email sent — check your inbox!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Access granted. Welcome back.');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'An error occurred';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared styles ──────────────────────────────────────── */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--surface-alt)',
    border: '1px solid var(--border-light)',
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    padding: '0.6rem 0.85rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '0.35rem',
  };

  return (
    <div
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
      className="min-h-screen flex items-center justify-center p-4 relative"
    >
      {/* Dot-grid background */}
      <div className="fixed inset-0 grid-overlay pointer-events-none" />

      {/* Corner classification label */}
      <div
        className="fixed top-5 left-6"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.18em', color: 'var(--glow)', opacity: 0.7 }}
      >
        KIZOKU NO YOZAI // SECURE ACCESS PORTAL
      </div>

      <div
        className="relative z-10 w-full max-w-sm"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 0 40px rgba(59,130,246,0.12)',
        }}
      >
        {/* Header bar */}
        <div
          style={{
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--surface-alt)',
            padding: '0.6rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--glow)', boxShadow: '0 0 6px var(--glow)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
            {isSignUp ? 'ENROLL // NEW CADET' : 'AUTHENTICATE // RETURNING OFFICER'}
          </span>
        </div>

        <div className="p-8">
          {/* Icon + title */}
          <div className="flex flex-col items-center mb-8">
            <Shield
              style={{ color: 'var(--glow)', filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.6))' }}
              className="w-10 h-10 mb-4"
            />
            <h1
              style={{
                fontFamily: 'var(--font-cinzel)',
                color: 'var(--text)',
                letterSpacing: '0.1em',
                textShadow: '0 0 16px rgba(59,130,246,0.4)',
              }}
              className="text-2xl font-bold uppercase text-center"
            >
              {isSignUp ? 'Enroll Cadet' : 'Access Vault'}
            </h1>
            <p
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}
              className="mt-2 text-center"
            >
              {isSignUp
                ? 'Create your officer profile to begin'
                : 'Enter credentials to access your character files'}
            </p>
          </div>

          {/* Email-sent confirmation state */}
          {emailSent ? (
            <div
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-alt)',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--glow)', marginBottom: '0.5rem' }}>
                ◈ TRANSMISSION SENT
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Check <strong style={{ color: 'var(--text)' }}>{email}</strong> for a confirmation link to complete your enrollment.
              </p>
              <button
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--glow)', marginTop: '1rem', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}
                onClick={() => { setEmailSent(false); setIsSignUp(false); }}
              >
                Return to Sign In →
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-5">
              {isSignUp && (
                <div>
                  <label style={labelStyle}>Username</label>
                  <input
                    type="text"
                    placeholder="cadet_handle"
                    style={inputStyle}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--glow)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" style={labelStyle}>Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="officer@academy.xyz"
                  style={inputStyle}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--glow)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" style={labelStyle}>Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••••"
                  style={inputStyle}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--glow)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? 'var(--border)' : '#0353a4',
                  color: '#fff',
                  border: '1px solid #0353a4',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  padding: '0.7rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s, box-shadow 0.2s',
                  marginTop: '0.5rem',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 18px rgba(59,130,246,0.5)';
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)';
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = loading ? 'var(--border)' : 'var(--accent)';
                }}
              >
                {loading ? (
                  <span className="animate-pulse">Processing…</span>
                ) : isSignUp ? (
                  <><UserPlus size={14} /> Enroll</>
                ) : (
                  <><LogIn size={14} /> Authenticate <ChevronRight size={14} /></>
                )}
              </button>
            </form>
          )}

          {/* Toggle sign-in / sign-up */}
          {!emailSent && (
            <div className="mt-6 text-center">
              <div className="rule-glow mb-5" />
              <button
                onClick={() => { setIsSignUp(!isSignUp); setEmail(''); setPassword(''); setUsername(''); }}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--glow)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {isSignUp
                  ? '← Already enrolled? Sign in'
                  : 'New recruit? → Request enrollment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
