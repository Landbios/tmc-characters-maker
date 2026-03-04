import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TMC Character Vault',
    short_name: 'TMC Vault',
    description: 'Create and manage your TMC characters. A sci-fi military academy character management system.',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#030712',
    theme_color: '#0353a4',
    categories: ['utilities', 'entertainment'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Ver Personajes',
        short_name: 'Dashboard',
        description: 'Ver todos los personajes registrados',
        url: '/dashboard',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Mi Perfil',
        short_name: 'Perfil',
        description: 'Ver y gestionar mis personajes',
        url: '/profile',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Nuevo Personaje',
        short_name: 'Nuevo',
        description: 'Crear un nuevo personaje',
        url: '/',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
    screenshots: [],
  };
}
