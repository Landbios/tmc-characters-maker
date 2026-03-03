'use client';

import { useState, Suspense } from 'react';
import CharacterSheet from '@/components/CharacterSheet';
import CharacterEditor from '@/components/CharacterEditor';
import { useCharacterStore } from '@/store/character-store';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

function EditorFallback() {
  return <div className="p-6 text-center text-ethereal-text/60">Cargando editor...</div>;
}

export default function Home() {
  const { character } = useCharacterStore();
  const [isEditorOpen, setIsEditorOpen] = useState(true);

  return (
    <main style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }} className="flex h-screen w-full overflow-hidden">
      {/* Mobile Toggle */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Button 
          size="icon" 
          variant="outline" 
          className="rounded-full w-14 h-14 shadow-lg"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--glow)', color: 'var(--glow)' }}
          onClick={() => setIsEditorOpen(!isEditorOpen)}
        >
          {isEditorOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Editor Sidebar */}
      <div 
        className={`
          fixed inset-x-0 bottom-0 z-40 w-full h-[100dvh] transform transition-transform duration-300 ease-in-out
          ${isEditorOpen ? 'translate-y-0' : 'translate-y-full'}
          md:relative md:inset-auto md:h-auto md:w-[400px] md:transform-none
        `}
        style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}
      >
        <Suspense fallback={<EditorFallback />}>
          <CharacterEditor />
        </Suspense>
      </div>

      {/* Preview Area */}
      <div className="flex-1 h-full overflow-y-auto relative" style={{ backgroundColor: 'var(--bg)' }}>
        {/* Dot-grid background */}
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="relative z-10">
          <CharacterSheet character={character} />
        </div>
      </div>
    </main>
  );
}
