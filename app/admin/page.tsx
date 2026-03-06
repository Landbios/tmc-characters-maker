'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Shield, ChevronLeft, UserCog } from 'lucide-react';
import Link from 'next/link';
import { censorEmail } from '@/utils/format';

interface Profile {
  id: string;
  email: string;
  role: 'roleplayer' | 'staff' | 'superadmin';
  created_at: string;
}

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Verify superadmin role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (!profile || profile.role !== 'superadmin') {
        toast.error('Acceso denegado — se requieren privilegios de Super Administrador.');
        router.push('/dashboard');
        return;
      }

      // Fetch all profiles
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Error al cargar la base de datos de usuarios');
      } else {
        setProfiles(profilesData || []);
      }
      setLoading(false);
    };

    fetchAdminData();
  }, [supabase, router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast.error('Error al actualizar el rol');
    } else {
      toast.success('Rol actualizado con éxito');
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole as 'roleplayer' | 'staff' | 'superadmin' } : p));
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0f172a', color: '#fff' }} className="min-h-screen flex flex-col items-center justify-center">
        <Shield className="w-10 h-10 animate-pulse text-red-500 mb-4" />
        <p className="font-mono text-xs tracking-[0.2em] text-red-400 uppercase animate-pulse">
          Verificando credenciales de Nivel Omega...
        </p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc' }} className="min-h-screen relative font-mono">
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="mb-10 flex items-center justify-between border-b border-red-900/50 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-red-500">
              <Shield size={24} />
              <span className="text-xs tracking-[0.3em] uppercase font-bold">Terminal de Administración</span>
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-widest text-white shadow-red">
              Control de Accesos
            </h1>
          </div>
          
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors text-xs uppercase tracking-widest">
              <ChevronLeft size={16} /> Volver al Dashboard
            </button>
          </Link>
        </div>

        {/* Profiles Table */}
        <div className="bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 uppercase text-xs tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-normal">Usuario (Email)</th>
                  <th className="px-6 py-4 font-normal">ID Sistema</th>
                  <th className="px-6 py-4 font-normal">Fecha Registro</th>
                  <th className="px-6 py-4 font-normal text-right">Nivel de Acceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {profiles.map(profile => (
                  <tr key={profile.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <UserCog size={16} className={
                        profile.role === 'superadmin' ? 'text-red-500' :
                        profile.role === 'staff' ? 'text-green-500' : 'text-blue-500'
                      } />
                      {censorEmail(profile.email)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {profile.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={profile.role}
                        onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                        className={`bg-slate-950 border text-xs uppercase px-3 py-1.5 outline-none tracking-wider cursor-pointer transition-colors ${
                          profile.role === 'superadmin' ? 'border-red-500/50 text-red-400' :
                          profile.role === 'staff' ? 'border-green-500/50 text-green-400' :
                          'border-slate-700 text-slate-300'
                        }`}
                      >
                        <option value="roleplayer">Roleplayer</option>
                        <option value="staff">Staff</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style jsx>{`
        .shadow-red {
          text-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }
      `}</style>
    </div>
  );
}
