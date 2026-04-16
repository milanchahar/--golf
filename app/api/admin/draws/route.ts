import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Draw } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireAdmin(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { user: null, profile: null, error: 'Unauthorized' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: profile, error: profileError } = (await db
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()) as { data: { role: string } | null; error: { message: string } | null }

  if (profileError || !profile) return { user: null, profile: null, error: 'Profile not found' }
  if (profile.role !== 'admin') return { user: null, profile: null, error: 'Forbidden: admin only' }

  return { user, profile, error: null }
}

// ─── GET /api/admin/draws ─────────────────────────────────────────────────────
// Lists all draws (any status) with winner counts per tier.
export async function GET() {
  const supabase = createClient()
  const { error: authErr } = await requireAdmin(supabase)
  if (authErr) {
    return NextResponse.json({ error: authErr }, { status: authErr === 'Unauthorized' ? 401 : 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Fetch all draws ordered newest first
  const { data: draws, error: drawsError } = (await db
    .from('draws')
    .select('*')
    .order('draw_month', { ascending: false })) as {
    data: Draw[] | null
    error: { message: string } | null
  }

  if (drawsError) {
    return NextResponse.json({ error: drawsError.message }, { status: 500 })
  }

  // For each draw, fetch winner counts
  const enriched = await Promise.all(
    (draws ?? []).map(async (draw) => {
      const { data: entries } = (await db
        .from('draw_entries')
        .select('prize_tier, is_winner')
        .eq('draw_id', draw.id)) as {
        data: { prize_tier: string | null; is_winner: boolean }[] | null
      }

      const entryList = entries ?? []
      return {
        ...draw,
        winner_counts: {
          five_match: entryList.filter((e) => e.prize_tier === '5-match').length,
          four_match: entryList.filter((e) => e.prize_tier === '4-match').length,
          three_match: entryList.filter((e) => e.prize_tier === '3-match').length,
          total_entries: entryList.length,
        },
      }
    })
  )

  return NextResponse.json({ draws: enriched })
}

// ─── POST /api/admin/draws ────────────────────────────────────────────────────
// Creates a new draw record with status = 'pending'.
// Does NOT run the draw yet — just provisions the draw record.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { error: authErr } = await requireAdmin(supabase)
  if (authErr) {
    return NextResponse.json({ error: authErr }, { status: authErr === 'Unauthorized' ? 401 : 403 })
  }

  let body: { draw_month: unknown; draw_type: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { draw_month, draw_type } = body

  // Validate draw_month format: "YYYY-MM"
  if (typeof draw_month !== 'string' || !/^\d{4}-\d{2}$/.test(draw_month)) {
    return NextResponse.json(
      { error: 'draw_month must be in "YYYY-MM" format.' },
      { status: 400 }
    )
  }

  if (draw_type !== 'random' && draw_type !== 'algorithmic') {
    return NextResponse.json(
      { error: 'draw_type must be "random" or "algorithmic".' },
      { status: 400 }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Check for existing draw for this month
  const { data: existing } = (await db
    .from('draws')
    .select('id')
    .eq('draw_month', draw_month)
    .maybeSingle()) as { data: { id: string } | null }

  if (existing) {
    return NextResponse.json(
      { error: `A draw already exists for ${draw_month}.` },
      { status: 409 }
    )
  }

  const { data: created, error: insertError } = (await db
    .from('draws')
    .insert({
      draw_month,
      draw_type,
      drawn_numbers: [],
      status: 'pending',
    })
    .select()
    .single()) as { data: Draw | null; error: { message: string } | null }

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ draw: created }, { status: 201 })
}
