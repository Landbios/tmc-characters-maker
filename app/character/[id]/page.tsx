import { createClient } from '@/utils/supabase/server';
import CharacterSheet from '@/components/CharacterSheet';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('id', id)
    .single();

  if (!character) {
    return {
      title: 'Personaje no encontrado',
    };
  }

  return {
    title: `${character.name} - Hoja de Personaje`,
    description: character.subtitle,
    openGraph: {
      images: [character.image_url],
    },
  };
}

export default async function CharacterPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: character, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !character) {
    notFound();
  }

  return <CharacterSheet character={character} />;
}
