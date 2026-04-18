import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/getUser';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: verifications, error } = await supabase
      .from('winner_verifications')
      .select('*, draws(draw_month)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(verifications);
  } catch (error: any) {
    console.error('Error fetching my verifications:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
