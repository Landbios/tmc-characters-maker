import { Character } from '@/types/character';

/**
 * Exports a single character to a downloadable JSON file.
 * Strips internal/runtime fields before download.
 */
export function exportCharacterToJSON(character: Character): void {
  // Strip server-only or auto-generated fields the user doesn't need to import
  const { created_at, ...exportable } = character as Character & { created_at?: string };
  void created_at; // intentionally discarded

  const json = JSON.stringify(exportable, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.name.replace(/\s+/g, '_')}_character.json`;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Parses a JSON file uploaded by the user into a partial Character object.
 * Returns only valid fields that exist in the Character type.
 * Throws if the file is not valid JSON or is missing a name.
 */
export async function parseCharacterFromJSON(file: File): Promise<Partial<Character>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);

        if (!raw || typeof raw !== 'object') {
          reject(new Error('El archivo no contiene un objeto JSON válido.'));
          return;
        }
        if (!raw.name) {
          reject(new Error('El personaje importado debe tener al menos un campo "name".'));
          return;
        }

        // Strip the `id` and `user_id` so a new one is generated on save
        const { id: _id, user_id: _uid, ...rest } = raw;
        void _id;
        void _uid;

        resolve(rest as Partial<Character>);
      } catch {
        reject(new Error('No se pudo leer el archivo. Asegúrate de que sea un JSON válido.'));
      }
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsText(file);
  });
}

/**
 * Exports a character in Tupperbox-compatible JSON format.
 * Schema reverse-engineered from a real Tupperbox export.
 *
 * Key fields:
 *   brackets  — ["Prefix:", ""] — opening and closing (empty = no suffix)
 *   tag       — appears in Discord after the proxied message (battlefront/frente)
 *   nick      — display name shown in the server (name + subtitle)
 *   avatar_url — full image URL
 *   description — shown in /tupper info
 */
export function exportCharacterToTupperbox(character: Character): void {
  // Build description (shown via /tupper info in Discord)
  const blaze = [character.element_blaze, character.element_user, character.element_advanced]
    .filter(Boolean)
    .join(' | ');

  const descParts: string[] = [];
  if (character.subtitle)       descParts.push(`**${character.subtitle}**`);
  if (character.age)            descParts.push(`Edad: ${character.age}`);
  if (character.height)         descParts.push(`Altura: ${character.height}`);
  if (character.nationality)    descParts.push(`Nac.: ${character.nationality}`);
  if (blaze)                    descParts.push(`Blaze: ${blaze}`);
  if (character.quote)          descParts.push(`\n*${character.quote.trim()}*`);

  // Proxy trigger: "Name: message content" → brackets[0] is the prefix, brackets[1] is suffix (empty)
  const prefix = `${character.name}:`;

  // Nick = what Discord shows as the "username" for the proxied message
  const nick = character.subtitle
    ? `${character.name} [${character.subtitle}]`
    : character.name;

  const tupperboxPayload = {
    groups: [],
    tuppers: [
      {
        name:          character.name,
        brackets:      [prefix, ''],           // ["Name:", ""] — matches real export exactly
        avatar_url:    character.image_url || null,
        banner:        null,
        posts:         0,
        show_brackets: false,
        birthday:      null,
        description:   descParts.length > 0 ? descParts.join('\n') : null,
        // tag = the text appended to the proxied message (used for battlefront/frente)
        tag:           character.battlefront_name || null,
        nick,
        group_id:      null,
        last_used:     null,
      },
    ],
  };

  const json = JSON.stringify(tupperboxPayload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.name.replace(/\s+/g, '_')}_tupperbox.json`;
  a.click();

  URL.revokeObjectURL(url);
}

/* ─────────────────────────── Bulk exports ─────────────────────────── */

/**
 * Exports multiple characters as a single JSON array.
 * Produces a file like: [{...char1}, {...char2}, ...]
 * Strip id / user_id / created_at so each can be re-imported as a new record.
 */
export function exportCharactersToJSON(characters: Character[]): void {
  const exportable = characters.map((char) => {
    const { id: _id, user_id: _uid, created_at: _ca, ...rest } =
      char as Character & { created_at?: string };
    void _id; void _uid; void _ca;
    return rest;
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const json = JSON.stringify(exportable, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `tmc_vault_export_${timestamp}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Exports multiple characters into a single Tupperbox-compatible JSON file.
 * Tupperbox supports bulk import via a JSON with a "tuppers" array — one entry per
 * character. All selected characters are stuffed into one download.
 */
export function exportCharactersToTupperbox(characters: Character[]): void {
  const tuppers = characters.map((character) => {
    const blaze = [character.element_blaze, character.element_user, character.element_advanced]
      .filter(Boolean)
      .join(' | ');

    const descParts: string[] = [];
    if (character.subtitle)    descParts.push(`**${character.subtitle}**`);
    if (character.age)         descParts.push(`Edad: ${character.age}`);
    if (character.height)      descParts.push(`Altura: ${character.height}`);
    if (character.nationality) descParts.push(`Nac.: ${character.nationality}`);
    if (blaze)                 descParts.push(`Blaze: ${blaze}`);
    if (character.quote)       descParts.push(`\n*${character.quote.trim()}*`);

    const nick = character.subtitle
      ? `${character.name} [${character.subtitle}]`
      : character.name;

    return {
      name:          character.name,
      brackets:      [`${character.name}:`, ''],
      avatar_url:    character.image_url || null,
      banner:        null,
      posts:         0,
      show_brackets: false,
      birthday:      null,
      description:   descParts.length > 0 ? descParts.join('\n') : null,
      tag:           character.battlefront_name || null,
      nick,
      group_id:      null,
      last_used:     null,
    };
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const payload = { groups: [], tuppers };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `tmc_tupperbox_bulk_${timestamp}.json`;
  a.click();

  URL.revokeObjectURL(url);
}


