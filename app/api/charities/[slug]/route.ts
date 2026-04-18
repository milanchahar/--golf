import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient();
    
    // Fetch Charity
    const { data: charity, error: charityError } = await supabase
      .from('charities')
      .select('*')
      .eq('slug', params.slug)
      .eq('is_active', true)
      .single();

    if (charityError || !charity) {
      return NextResponse.json({ error: 'Charity not found' }, { status: 404 });
    }

    // Fetch future Charity Events
    const today = new Date().toISOString().split('T')[0];
    const { data: events, error: eventsError } = await supabase
      .from('charity_events')
      .select('*')
      .eq('charity_id', charity.id)
      .gte('event_date', today)
      .order('event_date', { ascending: true });

    if (eventsError) throw eventsError;

    return NextResponse.json({
      charity,
      events
    });
  } catch (error: any) {
    console.error('Error fetching charity detail:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
