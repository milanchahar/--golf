import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runFullDraw, MIN_SCORES_TO_ENTER } from '@/lib/drawEngine'
import { Draw, SimulationPreview } from '@/types'

// ─── Helper: assert admin ──────────────────────────────────────────────────────
async function requireAdmin(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return { user: null, error: 'Unauthorized' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: profile } = (await db
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()) as { data: { role: string } | null }

  if (!profile || profile.role !== 'admin') return { user: null, error: 'Forbidden' }
  return { user, error: null }
}

// ─── Helper: load eligible entries for a draw ─────────────────────────────────
async function loadEligibleEntries(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any
): Promise<{ user_id: string; scores: number[] }[]> {
  // Fetch all active subscribers
  const { data: activeUsers } = (await db
    .from('profiles')
    .select('id')
    .eq('subscription_status', 'active')) as { data: { id: string }[] | null }

  if (!activeUsers || activeUsers.length === 0) return []

  const activeUserIds = activeUsers.map((u: { id: string }) => u.id)

  // Fetch their golf scores
  const { data: allScores } = (await db
    .from('golf_scores')
    .select('user_id, score')
    .in('user_id', activeUserIds)) as {
    data: { user_id: string; score: number }[] | null
  }

  if (!allScores || allScores.length === 0) return []

  // Group scores by user
  const scoresByUser: Record<string, number[]> = {}
  for (const row of allScores) {
    if (!scoresByUser[row.user_id]) scoresByUser[row.user_id] = []
    scoresByUser[row.user_id].push(row.score)
  }

  // Filter: only users with at least MIN_SCORES_TO_ENTER scores
  return Object.entries(scoresByUser)
    .filter(([, scores]) => scores.length >= MIN_SCORES_TO_ENTER)
    .map(([user_id, scores]) => ({ user_id, scores }))
}

// ─── POST /api/admin/draws/[id]/simulate ──────────────────────────────────────
// Runs the draw engine against eligible users — preview only, nothing saved.
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { error: authErr } = await requireAdmin(supabase)
  if (authErr) {
    return NextResponse.json({ error: authErr }, { status: authErr === 'Unauthorized' ? 401 : 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Load the draw record
  const { data: draw, error: drawError } = (await db
    .from('draws')
    .select('*')
    .eq('id', params.id)
    .single()) as { data: Draw | null; error: { message: string } | null }

  if (drawError || !draw) {
    return NextResponse.json({ error: 'Draw not found.' }, { status: 404 })
  }

  if (draw.status === 'published') {
    return NextResponse.json(
      { error: 'This draw is already published and cannot be re-simulated.' },
      { status: 400 }
    )
  }

  // Load eligible users
  const entries = await loadEligibleEntries(db)

  // Run the draw (fresh random seed — this is a preview, not persisted)
  const TOTAL_POOL = 1000  // placeholder pool amount in €
  const { drawnNumbers, results } = runFullDraw(draw.draw_type, entries, TOTAL_POOL, 0)

  const fiveMatchWinners = results.filter((r) => r.prize_tier === '5-match').map((r) => r.user_id)
  const fourMatchWinners = results.filter((r) => r.prize_tier === '4-match').map((r) => r.user_id)
  const threeMatchWinners = results.filter((r) => r.prize_tier === '3-match').map((r) => r.user_id)

  const preview: SimulationPreview = {
    drawn_numbers: drawnNumbers,
    five_match_winners: fiveMatchWinners,
    four_match_winners: fourMatchWinners,
    three_match_winners: threeMatchWinners,
    prize_breakdown: {
      fiveMatch: fiveMatchWinners.length > 0 ? (results.find((r) => r.prize_tier === '5-match')?.prize_amount ?? 0) : 0,
      fourMatch: fourMatchWinners.length > 0 ? (results.find((r) => r.prize_tier === '4-match')?.prize_amount ?? 0) : 0,
      threeMatch: threeMatchWinners.length > 0 ? (results.find((r) => r.prize_tier === '3-match')?.prize_amount ?? 0) : 0,
    },
    total_eligible_users: entries.length,
  }

  // Mark draw as simulated (does NOT store draw_entries)
  await db
    .from('draws')
    .update({ status: 'simulated' })
    .eq('id', params.id)

  return NextResponse.json({ simulation: preview })
}
