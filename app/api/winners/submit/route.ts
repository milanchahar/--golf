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

    const body = await request.json();
    const { draw_entry_id, proof_image_url } = body;

    if (!draw_entry_id || !proof_image_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate the user is a winner
    const { data: entry, error: entryError } = await supabase
      .from('draw_entries')
      .select('is_winner, draw_id')
      .eq('id', draw_entry_id)
      .eq('user_id', user.id)
      .single();

    if (entryError || !entry || !entry.is_winner) {
      return NextResponse.json({ error: 'Invalid or non-winning entry' }, { status: 403 });
    }

    // Insert verification
    const { data: verification, error: insertError } = await supabase
      .from('winner_verifications')
      .insert({
        draw_entry_id,
        user_id: user.id,
        draw_id: entry.draw_id,
        proof_image_url,
        status: 'pending',
        payment_status: 'unpaid'
      })
      .select()
      .single();

    if (insertError) {
      // Return 409 if already submitted (handled by unique constraint in DB)
      if (insertError.code === '23505') {
         return NextResponse.json({ error: 'Verification already submitted' }, { status: 409 });
      }
      throw insertError;
    }

    return NextResponse.json(verification);
  } catch (error: any) {
    console.error('Error submitting verification:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
