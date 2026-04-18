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
    const plan = searchParams.get('plan');

    let query = supabase.from('profiles').select('id, full_name, email, subscription_status, subscription_plan, subscription_renewal_date').neq('subscription_plan', null);

    if (status) query = query.eq('subscription_status', status);
    if (plan) query = query.eq('subscription_plan', plan);

    const { data: subscriptions, error } = await query.order('subscription_renewal_date', { ascending: true });

    if (error) throw error;
    
    return NextResponse.json(subscriptions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
