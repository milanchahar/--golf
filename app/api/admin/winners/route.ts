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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase.from('winner_verifications').select('*, profiles(full_name, email), draws(draw_month)').order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: verifications, error } = await query;
    if (error) throw error;
    
    return NextResponse.json(verifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
