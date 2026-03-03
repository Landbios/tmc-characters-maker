import type {Metadata} from 'next';
import { 
  Cormorant_Garamond, 
  Inter, 
  Pinyon_Script,
  Playfair_Display,
  Cinzel,
  Libre_Baskerville,
  Lato,
  Montserrat,
  Roboto
} from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

// Serifs
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-cormorant', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', display: 'swap' });
const baskerville = Libre_Baskerville({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-baskerville', display: 'swap' });

// Sans
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const lato = Lato({ subsets: ['latin'], weight: ['100', '300', '400', '700', '900'], variable: '--font-lato', display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' });
const roboto = Roboto({ subsets: ['latin'], weight: ['100', '300', '400', '500', '700', '900'], variable: '--font-roboto', display: 'swap' });

// Script
const pinyon = Pinyon_Script({ weight: '400', subsets: ['latin'], variable: '--font-script', display: 'swap' });

export const metadata: Metadata = {
  title: 'TMC Character Vault',
  description: 'Create and manage your TMC characters. A sci-fi military academy character management system.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`
      ${cormorant.variable} ${playfair.variable} ${cinzel.variable} ${baskerville.variable}
      ${inter.variable} ${lato.variable} ${montserrat.variable} ${roboto.variable}
      ${pinyon.variable}
    `}>
      <body suppressHydrationWarning style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }} className="antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
