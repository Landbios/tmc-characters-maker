import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/characters/[id]
 * Public endpoint. Returns a single character by id.
 * Intentionally omits user_id for privacy.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Character not found' }, { status: 404 });
  }

  // Strip user_id for privacy before returning
  const { user_id: _, ...publicData } = data;
  void _;

  return NextResponse.json({ data: publicData });
}
