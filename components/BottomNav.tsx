'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, User, Plus, Shield } from 'lucide-react';

/**
 * Bottom navigation bar — only visible when the app is installed as a PWA
 * (display-mode: standalone). In a browser it stays hidden.
 *
 * Uses `standalone:flex` to show, and `hidden` as the default.
 */
export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Vault', Icon: LayoutGrid },
    { href: '/',          label: 'Nuevo',  Icon: Plus       },
    { href: '/tutores',   label: 'Tutores', Icon: Shield    },
    { href: '/profile',   label: 'Perfil',  Icon: User      },
  ];

  return (
    <nav
      className="hidden standalone:flex"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        // account for iOS home indicator
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -4px 24px rgba(3,7,18,0.18)',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      {links.map(({ href, label, Icon }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '8px 0 10px',
              textDecoration: 'none',
              color: isActive ? '#3B82F6' : 'var(--text-muted)',
              transition: 'color 0.15s',
              position: 'relative',
            }}
          >
            {/* Active indicator dot */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#3B82F6',
                }}
              />
            )}
            <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
