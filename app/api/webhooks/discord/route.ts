import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DEFAULT_LAYOUT } from '@/types/character';

/**
 * POST /api/webhooks/discord
 * Secure endpoint for a Discord bot to automatically create characters.
 *
 * Authentication: Bearer token matching DISCORD_BOT_SECRET env variable.
 *
 * Expected JSON body (all optional except name and user_id):
 * {
 *   "user_id": "supabase-user-uuid",       ← required: the character owner
 *   "name": "Character Name",               ← required
 *   "subtitle": "Title",
 *   "image_url": "https://...",
 *   "age": "18",
 *   "height": "1.70m",
 *   "nationality": "...",
 *   "element_blaze": "...",
 *   "element_user": "...",
 *   "element_advanced": "...",
 *   "blaze_type": "...",
 *   "blaze_image_url": "https://...",
 *   "battlefront_name": "Akatsuki",
 *   "offensive_power": "C",
 *   "defensive_power": "C",
 *   "mana_amount": "C",
 *   "mana_control": "C",
 *   "physical_ability": "C",
 *   "luck": "C",
 *   "quote": "...",
 *   "character_category": "student" | "tutor"
 * }
 */
export async function POST(request: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────
  const secret = process.env.DISCORD_BOT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Webhook not configured. Set DISCORD_BOT_SECRET in environment variables.' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { user_id, name, ...rest } = body;

  if (!user_id || typeof user_id !== 'string') {
    return NextResponse.json({ error: 'Missing required field: user_id' }, { status: 400 });
  }
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
  }

  // ── Build character record ─────────────────────────────────────
  const isTutor = rest.character_category === 'tutor';
  const characterData = {
    user_id,
    name,
    subtitle:          rest.subtitle          || '',
    image_url:         rest.image_url         || '',
    age:               rest.age               || '',
    height:            rest.height            || '',
    nationality:       rest.nationality       || '',
    element_user:      rest.element_user      || '',
    element_blaze:     rest.element_blaze     || '',
    element_advanced:  rest.element_advanced  || '',
    blaze_type:        rest.blaze_type        || '',
    blaze_image_url:   rest.blaze_image_url   || '',
    battlefront_name:  isTutor ? '' : (rest.battlefront_name as string || ''),
    battlefront_desc:  isTutor ? '' : (rest.battlefront_desc as string || ''),
    offensive_power:   rest.offensive_power   || 'C',
    defensive_power:   rest.defensive_power   || 'C',
    mana_amount:       rest.mana_amount       || 'C',
    mana_control:      rest.mana_control      || 'C',
    physical_ability:  rest.physical_ability  || 'C',
    luck:              rest.luck              || 'C',
    noble_arts:        rest.noble_arts        || [],
    quote:             rest.quote             || '',
    character_category: isTutor ? 'tutor' : 'student',
    // Default layout — tutors get layout without the battlefront section
    layout: isTutor
      ? DEFAULT_LAYOUT.filter(s => s.type !== 'battlefront')
      : DEFAULT_LAYOUT,
    // Design defaults
    background_color:            '#FFF5F5',
    background_overlay_opacity:  0.5,
    text_color:                  '#2D2D2D',
    font_heading:                'var(--font-cormorant)',
    font_body:                   'var(--font-inter)',
    frame_style:                 'ornate',
    card_bg_color:               '#ffffff',
    card_bg_opacity:             0.4,
    blaze_show_border:           true,
    blaze_image_size:            'md',
  };

  // ── Insert into Supabase ───────────────────────────────────────
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('characters')
    .insert(characterData)
    .select('id, name, character_category')
    .single();

  if (error) {
    console.error('[discord-webhook] Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    character: {
      id: data.id,
      name: data.name,
      category: data.character_category,
      url: `/character/${data.id}`,
    },
  }, { status: 201 });
}
