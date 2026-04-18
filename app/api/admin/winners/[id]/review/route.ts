import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/getUser';

async function checkAdmin(supabase: any) {
  const user = await getUser(supabase);
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const adminUser = await checkAdmin(supabase);
    if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { status, admin_notes } = body;

    let payment_status = undefined;
    if (status === 'approved') payment_status = 'pending';
    
    const { data: verification, error } = await supabase
      .from('winner_verifications')
      .update({
        status,
        admin_notes,
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
        ...(payment_status && { payment_status })
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
