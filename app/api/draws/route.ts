import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Draw, DrawEntry } from '@/types'

// ─── GET /api/draws ───────────────────────────────────────────────────────────
// Returns all published draws for the authenticated user.
// Includes: draw details, aggregate winner counts, and the calling user's
// own draw_entry (if they participated).
export async function GET() {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Fetch all published draws, newest first
  const { data: draws, error: drawsError } = (await db
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('draw_month', { ascending: false })) as {
    data: Draw[] | null
    error: { message: string } | null
  }

  if (drawsError) {
    return NextResponse.json({ error: drawsError.message }, { status: 500 })
  }

  if (!draws || draws.length === 0) {
    return NextResponse.json({ draws: [] })
  }

  const drawIds = draws.map((d) => d.id)

  // Fetch all entries for these draws in one query
  const { data: allEntries } = (await db
    .from('draw_entries')
    .select('*')
    .in('draw_id', drawIds)) as { data: DrawEntry[] | null }

  const entries = allEntries ?? []

  // Enrich each draw with winner counts + the calling user's entry
  const enriched = draws.map((draw) => {
    const drawEntries = entries.filter((e) => e.draw_id === draw.id)
    const myEntry = drawEntries.find((e) => e.user_id === user.id) ?? null

    return {
      ...draw,
      winner_counts: {
        five_match: drawEntries.filter((e) => e.prize_tier === '5-match').length,
        four_match: drawEntries.filter((e) => e.prize_tier === '4-match').length,
        three_match: drawEntries.filter((e) => e.prize_tier === '3-match').length,
        total_entries: drawEntries.length,
      },
      my_entry: myEntry,
    }
  })

  return NextResponse.json({ draws: enriched })
}
