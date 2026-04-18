import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/getUser';

async function checkAdmin(supabase: any) {
  const user = await getUser(supabase);
  return user && user.role === 'admin';
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    if (!(await checkAdmin(supabase))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    const { data: charity, error } = await supabase
      .from('charities')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(charity);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    if (!(await checkAdmin(supabase))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Soft delete
    const { data: charity, error } = await supabase
      .from('charities')
      .update({ is_active: false })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(charity);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
