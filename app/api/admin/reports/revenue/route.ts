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

    const { data: prizePools, error } = await supabase.from('prize_pools').select('draw_month, total_active_subscribers, subscription_revenue, created_at').order('draw_month', { ascending: false }).limit(12);
    if (error) throw error;
    
    // Sort chronological
    const revenueData = prizePools.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return NextResponse.json(revenueData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
