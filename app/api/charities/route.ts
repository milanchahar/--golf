import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const isFeatured = searchParams.get('featured') === 'true';
    const searchQuery = searchParams.get('search');

    let query = supabase.from('charities').select('*').eq('is_active', true);

    if (isFeatured) {
      query = query.eq('is_featured', true);
    }
    
    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data: charities, error } = await query;

    if (error) throw error;
    
    return NextResponse.json(charities);
  } catch (error: any) {
    console.error('Error fetching charities:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
