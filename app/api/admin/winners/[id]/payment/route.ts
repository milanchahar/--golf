import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/getUser';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { payment_reference } = body;
    
    if (!payment_reference) {
      return NextResponse.json({ error: 'Missing payment_reference' }, { status: 400 });
    }

    const { data: verification, error } = await supabase
      .from('winner_verifications')
      .update({
        payment_status: 'paid',
        payment_reference,
        payment_completed_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(verification);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
