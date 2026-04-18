import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/getUser';

async function checkAdmin(supabase: any) {
  const user = await getUser(supabase);
  if (!user || user.role !== 'admin') return null;
  return user;
}

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    if (!(await checkAdmin(supabase))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase.from('profiles').select('*, golf_scores(count)').order('created_at', { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (status) query = query.eq('subscription_status', status);
    if (plan) query = query.eq('subscription_plan', plan);

    const { data: users, error } = await query.limit(limit);

    if (error) throw error;
    
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
