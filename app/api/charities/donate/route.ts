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

    const { charity_id, amount } = await request.json();

    if (!charity_id || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount or missing charity_id' }, { status: 400 });
    }

    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

    // Insert independent donation intent
    const { data: contribution, error } = await supabase
      .from('charity_contributions')
      .insert({
        user_id: user.id,
        charity_id,
        amount,
        contribution_month: currentMonth,
        contribution_type: 'independent'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(contribution);
  } catch (error: any) {
    console.error('Error creating independent donation:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
