import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PrizePool } from '@/types'

// ─── Helper: assert admin ──────────────────────────────────────────────────────
async function requireAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, error: 'Unauthorized' as const }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: profile } = (await db
    .from('profiles').select('role').eq('id', user.id).single()) as { data: { role: string } | null }
  if (!profile || profile.role !== 'admin') return { user: null, error: 'Forbidden' as const }
  return { user, error: null }
}

// ─── GET /api/admin/prize-pool/[draw_id] ──────────────────────────────────────
// Returns the prize pool record for a specific draw (admin only).
export async function GET(
  _request: NextRequest,
  { params }: { params: { draw_id: string } }
) {
  const supabase = createClient()
  const { error: authErr } = await requireAdmin(supabase)
  if (authErr) {
    return NextResponse.json({ error: authErr }, { status: authErr === 'Unauthorized' ? 401 : 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: pool, error } = (await db
    .from('prize_pools')
    .select('*')
    .eq('draw_id', params.draw_id)
    .single()) as { data: PrizePool | null; error: { message: string } | null }

  if (error || !pool) {
    return NextResponse.json(
      { error: 'Prize pool not found for this draw.' },
      { status: 404 }
    )
  }

  return NextResponse.json({ prize_pool: pool })
}
