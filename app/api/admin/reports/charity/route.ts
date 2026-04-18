import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/getUser';

async function checkAdmin(supabase: any) {
  const user = await getUser(supabase);
  return user && user.role === 'admin';
}

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    if (!(await checkAdmin(supabase))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Summing by charity directly returning stats
    const { data: charities, error: charityError } = await supabase.from('charities').select('id, name, total_raised');
    if (charityError) throw charityError;

    const { data: contributions, error: countError } = await supabase.from('charity_contributions').select('charity_id, amount');
    if (countError) throw countError;

    const stats = charities.map(c => {
      const charContribs = contributions.filter(x => x.charity_id === c.id);
      return {
         ...c,
         contribution_count: charContribs.length
      }
    }).sort((a,b) => (b.total_raised || 0) - (a.total_raised || 0));

    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
