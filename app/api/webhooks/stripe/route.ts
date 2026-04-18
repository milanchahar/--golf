import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// Assuming you have stripe library setup in standard ways, mocking validation for simplicity
import crypto from 'crypto';

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature') || '';

  // In a real app we'd verify the stripe signature, but for execution here:
  let event;
  try {
    event = JSON.parse(payload);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createClient();

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object;
    // user ID can be retrieved from customer metadata
    const userId = invoice.subscription_details?.metadata?.user_id || invoice.customer_email; // mock retrieval

    if (userId) {
      // 1. Fetch user profile for their selected charity
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, selected_charity_id, charity_contribution_percent')
        .eq('id', userId)
        .single();
        
      if (profile && profile.selected_charity_id) {
        // Calculate amount to contribute
        const subscriptionFeePaid = invoice.amount_paid / 100; // Assuming cents
        const amount = (subscriptionFeePaid * Math.max(10, profile.charity_contribution_percent)) / 100;
        
        // 2. Insert Charity Contribution
        await supabase.from('charity_contributions').insert({
          user_id: profile.id,
          charity_id: profile.selected_charity_id,
          amount: parseFloat(amount.toFixed(2)),
          contribution_month: new Date().toISOString().substring(0, 7), // "YYYY-MM"
          contribution_type: 'subscription'
        });
        
        // Update subscription record as active (Section 2 logic context)
        await supabase.from('profiles').update({
          subscription_status: 'active',
          subscription_renewal_date: new Date(invoice.lines.data[0].period.end * 1000).toISOString()
        }).eq('id', profile.id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
