import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateScore } from '@/lib/scores'
import { GolfScore } from '@/types'

// ─── PUT /api/scores/[id] ────────────────────────────────────────────────────
// Updates the score value of an existing score.
// The date cannot be changed — only the score value.
export async function PUT(
  request: NextRequest,
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

  let body: { score: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { score } = body

  if (typeof score !== 'number' || !validateScore(score)) {
    return NextResponse.json(
      { error: 'Score must be a whole number between 1 and 45.' },
      { status: 400 }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Verify ownership — only update if the row belongs to the calling user
  const { data: existing, error: existingError } = (await db
    .from('golf_scores')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()) as { data: { id: string } | null; error: { message: string } | null }

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 })
  }

  if (!existing) {
    return NextResponse.json(
      { error: 'Score not found or access denied.' },
      { status: 404 }
    )
  }

  const { data: updated, error: updateError } = (await db
    .from('golf_scores')
    .update({ score: score as number })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()) as { data: GolfScore | null; error: { message: string } | null }

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ score: updated })
}

// ─── DELETE /api/scores/[id] ─────────────────────────────────────────────────
// Deletes a score belonging to the authenticated user.
export async function DELETE(
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

  // Verify ownership before deleting
  const { data: existing, error: existingError } = (await db
    .from('golf_scores')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()) as { data: { id: string } | null; error: { message: string } | null }

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 })
  }

  if (!existing) {
    return NextResponse.json(
      { error: 'Score not found or access denied.' },
      { status: 404 }
    )
  }

  const { error: deleteError } = (await db
    .from('golf_scores')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)) as { error: { message: string } | null }

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
