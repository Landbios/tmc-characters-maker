'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Character } from '@/types/character';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Terminal, ShieldAlert, ChevronLeft, Eye, Edit, Scan } from 'lucide-react';
import Link from 'next/link';

export default function ShionDBPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterFaction, setFilterFaction] = useState('');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchShionData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Verify staff or superadmin role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (!profile || !['staff', 'superadmin'].includes(profile.role)) {
        toast.error('ERR 403: ACCESO DENEGADO. ANOMALÍA DETECTADA.');
        router.push('/dashboard');
        return;
      }

      // Fetch all characters
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Error de cifrado en la matriz');
      } else {
        setCharacters(data || []);
      }
      setLoading(false);
    };

    fetchShionData();
  }, [supabase, router]);

  const filteredCharacters = filterFaction 
    ? filterFaction === 'student' || filterFaction === 'otros'
      ? characters.filter(c => c.character_category === filterFaction || (!c.character_category && filterFaction === 'student'))
      : characters.filter(c => c.faction === filterFaction)
    : characters;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center glitched-bg">
        <Scan className="w-16 h-16 text-green-500 animate-pulse mb-4 opacity-70" />
        <p className="font-mono text-green-500 tracking-[0.4em] uppercase text-sm glitch-text">
          DESCIFRANDO NODOS DE SHION...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono relative overflow-hidden">
      {/* Glitch Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/10 to-transparent background-scan pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="mb-12 border-b border-green-500/30 pb-6">
          <div className="flex justify-between items-start mb-4 relative">
            <div>
              <div className="flex items-center gap-2 mb-1 text-green-400 opacity-80">
                <ShieldAlert size={18} className="animate-pulse" />
                <span className="text-[0.6rem] tracking-[0.3em]">SECURE SYSTEM OVERRIDE ACTIVE</span>
              </div>
              <h1 className="text-4xl font-black tracking-[0.2em] glitch-text leading-tight" data-text="SHION'S DATABASE">
                SHION&apos;S DATABASE
              </h1>
            </div>
            <Link href="/dashboard">
              <button className="flex items-center gap-2 px-4 py-2 border-2 border-green-500/50 text-green-400 hover:bg-green-500/10 transition-colors text-xs uppercase tracking-widest bg-black">
                <ChevronLeft size={16} /> Disconnect
              </button>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 text-xs tracking-widest mt-6">
            <span className="opacity-50">Filter Node:</span>
            <select
              value={filterFaction}
              onChange={e => setFilterFaction(e.target.value)}
              className="bg-black border border-green-500/50 text-green-400 py-1.5 px-3 outline-none focus:border-green-400 transition-colors uppercase tracking-widest cursor-pointer"
            >
              <optgroup label="FACTIONS">
                <option value="">ALL RECORDS</option>
                <option value="Frontier">FRONTIER</option>
                <option value="UNION">U.N.I.O.N</option>
                <option value="ODI">O.D.I</option>
                <option value="None">UNASSIGNED</option>
              </optgroup>
              <optgroup label="CATEGORIES">
                <option value="student">ESTUDIANTES</option>
                <option value="otros">OTROS</option>
              </optgroup>
            </select>
            <span className="opacity-50 ml-auto hidden md:inline">
              Records found: {filteredCharacters.length}
            </span>
          </div>
        </div>

        {/* Database List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCharacters.map(char => (
            <div 
              key={char.id} 
              className="border border-green-500/30 bg-black/60 p-4 relative group hover:border-green-400 transition-colors overflow-hidden"
            >
              {/* Corner decor */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold tracking-widest uppercase text-white mb-1 truncate max-w-[200px]" title={char.name}>
                    {char.name}
                  </h3>
                  <div className="text-[0.6rem] tracking-[0.2em] text-green-500/70 border border-green-500/30 inline-block px-2 py-0.5">
                    ID: {char.id.split('-')[0]}
                  </div>
                </div>
                {char.status === 'w.i.p' ? (
                  <span className="text-[0.6rem] tracking-wider border border-yellow-500 text-yellow-500 px-2 py-1 animate-pulse uppercase bg-yellow-950/30">
                    W.I.P
                  </span>
                ) : (
                  <span className="text-[0.6rem] tracking-wider border border-green-500 text-green-400 px-2 py-1 uppercase bg-green-950/30">
                    COMPLETED
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-6 text-xs text-green-400/80">
                <div className="flex justify-between border-b border-green-900 pb-1 border-dashed">
                  <span className="opacity-60">Faction:</span>
                  <span className="uppercase">{char.faction || 'UNKNOWN'}</span>
                </div>
                <div className="flex justify-between border-b border-green-900 pb-1 border-dashed">
                  <span className="opacity-60">Battlefront:</span>
                  <span className="uppercase">{char.battlefront_name || char.clan_name || 'UNKNOWN'}</span>
                </div>
                <div className="flex justify-between border-b border-green-900 pb-1 border-dashed">
                  <span className="opacity-60">Category:</span>
                  <span className="uppercase">{char.character_category || 'STUDENT'}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-green-500/20">
                <Link href={`/character/${char.id}`}>
                  <button className="text-green-500/60 hover:text-green-400 transition-colors flex items-center gap-1 text-[0.65rem] uppercase tracking-widest">
                    <Eye size={13} /> View
                  </button>
                </Link>
                <Link href={`/?id=${char.id}`}>
                  <button className="text-green-500/60 hover:text-white transition-colors flex items-center gap-1 text-[0.65rem] uppercase tracking-widest">
                    <Edit size={13} /> Override
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style jsx global>{`
        .background-scan {
          background-size: 100% 4px;
          animation: scanline 8s linear infinite;
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .glitch-text {
          position: relative;
        }
        .glitch-text::before, .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.8;
        }
        .glitch-text::before {
          left: 2px;
          text-shadow: -1px 0 red;
          clip: rect(24px, 550px, 90px, 0);
          animation: glitch-anim-2 3s infinite linear alternate-reverse;
        }
        .glitch-text::after {
          left: -2px;
          text-shadow: -1px 0 blue;
          clip: rect(85px, 550px, 140px, 0);
          animation: glitch-anim 2.5s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim {
          0% { clip: rect(10px, 9999px, 86px, 0); }
          20% { clip: rect(54px, 9999px, 12px, 0); }
          40% { clip: rect(98px, 9999px, 89px, 0); }
          60% { clip: rect(65px, 9999px, 4px, 0); }
          80% { clip: rect(32px, 9999px, 83px, 0); }
          100% { clip: rect(2px, 9999px, 45px, 0); }
        }
        @keyframes glitch-anim-2 {
          0% { clip: rect(65px, 9999px, 100px, 0); }
          20% { clip: rect(3px, 9999px, 42px, 0); }
          40% { clip: rect(89px, 9999px, 56px, 0); }
          60% { clip: rect(12px, 9999px, 94px, 0); }
          80% { clip: rect(44px, 9999px, 20px, 0); }
          100% { clip: rect(78px, 9999px, 63px, 0); }
        }
      `}</style>
    </div>
  );
}
