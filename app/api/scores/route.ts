import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateScore, isFutureDate, MAX_SCORES } from '@/lib/scores'
import { GolfScore } from '@/types'

// ─── GET /api/scores ────────────────────────────────────────────────────────
// Returns all scores for the currently authenticated user, newest date first.
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
  const { data: scores, error } = (await db
    .from('golf_scores')
    .select('*')
    .eq('user_id', user.id)
    .order('score_date', { ascending: false })) as {
    data: GolfScore[] | null
    error: { message: string } | null
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ scores })
}

// ─── POST /api/scores ───────────────────────────────────────────────────────
// Adds a new score for the authenticated user.
// Business rules enforced:
//   • score must be 1–45
//   • date must not be in the future
//   • no duplicate dates — returns 409 if one exists
//   • max 5 scores — if already 5, delete the oldest before inserting
export async function POST(request: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { score: unknown; score_date: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { score, score_date } = body

  // ── Validation ──────────────────────────────────────────────────────────
  if (typeof score !== 'number' || !validateScore(score)) {
    return NextResponse.json(
      { error: 'Score must be a whole number between 1 and 45.' },
      { status: 400 }
    )
  }

  if (typeof score_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(score_date)) {
    return NextResponse.json(
      { error: 'A valid date (YYYY-MM-DD) is required.' },
      { status: 400 }
    )
  }

  if (isFutureDate(score_date)) {
    return NextResponse.json(
      { error: 'Score date cannot be in the future.' },
      { status: 400 }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // ── Duplicate-date check ────────────────────────────────────────────────
  const { data: existing, error: existingError } = (await db
    .from('golf_scores')
    .select('id')
    .eq('user_id', user.id)
    .eq('score_date', score_date)
    .maybeSingle()) as { data: { id: string } | null; error: { message: string } | null }

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 })
  }

  if (existing) {
    return NextResponse.json(
      {
        error:
          'A score already exists for this date. Please edit or delete it.',
      },
      { status: 409 }
    )
  }

  // ── Fetch current scores ────────────────────────────────────────────────
  const { data: currentScores, error: fetchError } = (await db
    .from('golf_scores')
    .select('*')
    .eq('user_id', user.id)
    .order('score_date', { ascending: true })) as {
    data: GolfScore[] | null
    error: { message: string } | null
  }

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  // ── Evict oldest if already at the limit ────────────────────────────────
  if (currentScores && currentScores.length >= MAX_SCORES) {
    const oldest = currentScores[0] // ascending order → index 0 is oldest
    const { error: deleteError } = (await db
      .from('golf_scores')
      .delete()
      .eq('id', oldest.id)
      .eq('user_id', user.id)) as { error: { message: string } | null }

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
  }

  // ── Insert new score ────────────────────────────────────────────────────
  const { data: inserted, error: insertError } = (await db
    .from('golf_scores')
    .insert({ user_id: user.id, score: score as number, score_date })
    .select()
    .single()) as { data: GolfScore | null; error: { message: string } | null }

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ score: inserted }, { status: 201 })
}
