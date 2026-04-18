import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/getUser';

async function checkAdmin(supabase: any) {
  const user = await getUser(supabase);
  if (!user || user.role !== 'admin') {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    if (!(await checkAdmin(supabase))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: charities, error } = await supabase.from('charities').select('*').order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(charities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    if (!(await checkAdmin(supabase))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    const { data: charity, error } = await supabase
      .from('charities')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(charity);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
