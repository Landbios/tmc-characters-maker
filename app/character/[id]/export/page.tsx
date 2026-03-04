import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import StudentIdExport from '@/components/StudentIdExport';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ExportStudentIdPage({ params }: PageProps) {
  const supabase = await createClient();
  const resolvedParams = await params;
  
  const { data: character, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !character) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <StudentIdExport character={character} />
    </div>
  );
}
