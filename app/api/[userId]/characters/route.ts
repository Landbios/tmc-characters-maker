import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface RouteParams {
  params: Promise<{ userId: string }>;
}

/**
 * GET /api/[userId]/characters
 * Public endpoint. Returns all characters belonging to a specific user.
 * Query params:
 *   ?category=student|tutor  (optional)
 *   ?limit=20                (optional, max 100)
 *   ?offset=0                (optional)
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const supabase = await createClient();

  let query = supabase
    .from('characters')
    .select('id, name, subtitle, image_url, nationality, age, battlefront_name, element_blaze, blaze_type, character_category, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category === 'student' || category === 'tutor') {
    query = query.eq('character_category', category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, userId, limit, offset, count: data?.length ?? 0 });
}
