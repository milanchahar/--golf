import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Draw, DrawEntry } from '@/types'

// ─── GET /api/draws/[id] ──────────────────────────────────────────────────────
// Returns the full details of a single published draw.
// Includes: drawn numbers, aggregate winner counts per tier, and the calling
// user's own result (entry) if they participated in this draw.
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  // Load the draw — must be published
  const { data: draw, error: drawError } = (await db
    .from('draws')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'published')
    .single()) as { data: Draw | null; error: { message: string } | null }

  if (drawError || !draw) {
    return NextResponse.json(
      { error: 'Draw not found or not yet published.' },
      { status: 404 }
    )
  }

  // Load all entries for this draw
  const { data: allEntries, error: entriesError } = (await db
    .from('draw_entries')
    .select('*')
    .eq('draw_id', params.id)) as {
    data: DrawEntry[] | null
    error: { message: string } | null
  }

  if (entriesError) {
    return NextResponse.json({ error: entriesError.message }, { status: 500 })
  }

  const entries = allEntries ?? []
  const myEntry = entries.find((e) => e.user_id === user.id) ?? null

  return NextResponse.json({
    draw: {
      ...draw,
      winner_counts: {
        five_match: entries.filter((e) => e.prize_tier === '5-match').length,
        four_match: entries.filter((e) => e.prize_tier === '4-match').length,
        three_match: entries.filter((e) => e.prize_tier === '3-match').length,
        total_entries: entries.length,
      },
      my_entry: myEntry,
    },
  })
}
