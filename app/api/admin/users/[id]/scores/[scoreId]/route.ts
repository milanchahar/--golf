import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/getUser';

async function checkAdmin(supabase: any) {
  const user = await getUser(supabase);
  return user && user.role === 'admin';
}

export async function PUT(request: Request, { params }: { params: { id: string, scoreId: string } }) {
  try {
    const supabase = createClient();
    if (!(await checkAdmin(supabase))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { score, score_date } = body;

    const { data: updated, error } = await supabase
      .from('golf_scores')
      .update({ score, score_date, updated_at: new Date().toISOString() })
      .eq('id', params.scoreId)
      .eq('user_id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
