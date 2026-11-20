export type InlineTagType =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'glitch'
  | 'crisp'
  | 'redacted';

export type RichTextInline =
  | { type: 'text'; value: string }
  | { type: 'br' }
  | { type: InlineTagType; children: RichTextInline[] };

export type RichTextBlock =
  | { type: 'paragraph'; children: RichTextInline[] }
  | { type: 'divider' }
  | { type: 'comm'; header?: string; children: RichTextInline[] };

const INLINE_TAG_MAP: Record<string, InlineTagType> = {
  b: 'bold',
  i: 'italic',
  u: 'underline',
  s: 'strike',
  glitch: 'glitch',
  crisp: 'crisp',
  redacted: 'redacted',
};

const MAX_NESTING_DEPTH = 6;

/**
 * Splits a plain string on single newlines into text + br inline nodes.
 */
function textWithLineBreaks(input: string): RichTextInline[] {
  if (!input) return [];
  const lines = input.split('\n');
  const nodes: RichTextInline[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > 0) {
      nodes.push({ type: 'text', value: lines[i] });
    }
    if (i < lines.length - 1) {
      nodes.push({ type: 'br' });
    }
  }
  return nodes;
}

/**
 * Finds the matching closing tag `[/tagName]` accounting for nested same-name tags.
 * Returns the index of `[/tagName]`, or -1 if unclosed.
 */
function findMatchingClose(input: string, tagName: string, searchFrom: number): number {
  const openToken = `[${tagName}]`;
  const closeToken = `[/${tagName}]`;
  const lower = input.toLowerCase();
  let depth = 1;
  let cursor = searchFrom;

  while (cursor < lower.length) {
    const nextOpen = lower.indexOf(openToken, cursor);
    const nextClose = lower.indexOf(closeToken, cursor);

    if (nextClose === -1) return -1;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      cursor = nextOpen + openToken.length;
    } else {
      depth--;
      if (depth === 0) return nextClose;
      cursor = nextClose + closeToken.length;
    }
  }
  return -1;
}

/**
 * Parses inline formatting tags (`[b]`, `[i]`, `[u]`, `[s]`, `[glitch]`, `[crisp]`, `[redacted]`)
 * and preserves single `\n` as `{ type: 'br' }`. Unclosed or unknown tags fall back safely to plain text.
 */
export function parseInline(input: string, depth = 0): RichTextInline[] {
  if (!input) return [];
  if (depth >= MAX_NESTING_DEPTH) {
    return textWithLineBreaks(input);
  }

  const nodes: RichTextInline[] = [];
  let cursor = 0;

  while (cursor < input.length) {
    const openBracket = input.indexOf('[', cursor);
    if (openBracket === -1) {
      nodes.push(...textWithLineBreaks(input.slice(cursor)));
      break;
    }

    if (openBracket > cursor) {
      nodes.push(...textWithLineBreaks(input.slice(cursor, openBracket)));
    }

    const closeBracket = input.indexOf(']', openBracket + 1);
    if (closeBracket === -1) {
      nodes.push(...textWithLineBreaks(input.slice(openBracket)));
      break;
    }

    const rawTag = input.slice(openBracket + 1, closeBracket).trim().toLowerCase();
    const mappedType = INLINE_TAG_MAP[rawTag];

    if (!mappedType) {
      // Unknown tag — emit '[' literally and advance
      nodes.push({ type: 'text', value: '[' });
      cursor = openBracket + 1;
      continue;
    }

    const contentStart = closeBracket + 1;
    const closeIndex = findMatchingClose(input, rawTag, contentStart);

    if (closeIndex === -1) {
      // Unclosed tag — emit literal opening tag and keep parsing
      nodes.push({ type: 'text', value: input.slice(openBracket, contentStart) });
      cursor = contentStart;
      continue;
    }

    const innerContent = input.slice(contentStart, closeIndex);
    nodes.push({
      type: mappedType,
      children: parseInline(innerContent, depth + 1),
    });

    cursor = closeIndex + `[/${rawTag}]`.length;
  }

  return nodes;
}

/**
 * Parses a non-comm chunk of text into paragraph and divider blocks.
 */
function parseProseChunk(chunk: string): RichTextBlock[] {
  const blocks: RichTextBlock[] = [];
  const rawLines = chunk.split('\n');
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const joined = paragraphBuffer.join('\n').trim();
    paragraphBuffer = [];
    if (joined.length > 0) {
      blocks.push({
        type: 'paragraph',
        children: parseInline(joined),
      });
    }
  };

  for (const line of rawLines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushParagraph();
      continue;
    }

    if (trimmed.toLowerCase() === '[hr]' || /^-{3,}$/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: 'divider' });
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  return blocks;
}

/**
 * Deterministic rich-text parser for character sheet `custom_text` sections.
 * Supports:
 * - Multi-paragraph splitting on blank lines & preserved single line breaks
 * - Story dividers (`[hr]` or `---`)
 * - Old communication / transmission quote blocks (`[comm]...[/comm]` or `[comm:HEADER]...[/comm]`)
 * - Inline formatting (`[b]`, `[i]`, `[u]`, `[s]`, `[glitch]`, `[crisp]`, `[redacted]`)
 */
export function parseRichText(raw: string): RichTextBlock[] {
  if (!raw || !raw.trim()) return [];

  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks: RichTextBlock[] = [];
  const commRegex = /\[comm(?::([^\]]+))?\]([\s\S]*?)\[\/comm\]/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = commRegex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      blocks.push(...parseProseChunk(normalized.slice(lastIndex, match.index)));
    }

    const header = match[1]?.trim() || undefined;
    const body = match[2].replace(/^\n+|\n+$/g, '');
    if (body.length > 0 || header) {
      blocks.push({
        type: 'comm',
        header,
        children: parseInline(body),
      });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < normalized.length) {
    blocks.push(...parseProseChunk(normalized.slice(lastIndex)));
  }

  return blocks;
}
