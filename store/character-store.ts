'use client';

import { create } from 'zustand';
import { Character, DEFAULT_CHARACTER } from '@/types/character';

interface CharacterStore {
  character: Character;
  setCharacter: (character: Character) => void;
  updateField: (field: keyof Character, value: any) => void;
  reset: () => void;
}

export const useCharacterStore = create<CharacterStore>((set) => ({
  character: DEFAULT_CHARACTER,
  setCharacter: (character) => set({ character }),
  updateField: (field, value) => 
    set((state) => ({ 
      character: { ...state.character, [field]: value } 
    })),
  reset: () => set({ character: DEFAULT_CHARACTER }),
}));
