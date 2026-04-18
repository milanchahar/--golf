import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/getUser';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { charity_id, contribution_percent } = body;

    if (!charity_id || typeof contribution_percent !== 'number') {
      return NextResponse.json({ error: 'Missing charity_id or contribution_percent' }, { status: 400 });
    }

    // Validate percent between 10 and 50
    const percent = Math.max(10, Math.min(50, contribution_percent));

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({
        selected_charity_id: charity_id,
        charity_contribution_percent: percent
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    console.error('Error updating charity selection:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
