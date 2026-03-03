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
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <Button 
          size="icon" 
          variant="outline" 
          className="bg-white/80 backdrop-blur"
          onClick={() => setIsEditorOpen(!isEditorOpen)}
        >
          {isEditorOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Editor Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-40 w-full md:w-[400px] transform transition-transform duration-300 ease-in-out
          ${isEditorOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}
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
