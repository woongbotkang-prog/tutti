import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit') || '5'), 20)

  const supabase = await createClient()

  // gig_pieces → gigs(active) → pieces → composers, with author and region
  const { data: gigPieces, error } = await supabase
    .from('gig_pieces')
    .select(`
      piece_id,
      gig:gigs!inner(id, title, status, user_id,
        region:regions(name),
        author:user_profiles!gigs_user_id_fkey(display_name)
      ),
      piece:pieces!inner(id, title, period,
        composer:composers(name_ko, name_en)
      )
    `)
    .not('piece_id', 'is', null)
    .eq('gig.status', 'active')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by piece_id
  const grouped: Record<string, {
    piece_id: string
    piece_title: string
    composer_name_ko: string | null
    composer_name_en: string | null
    period: string | null
    teams: { gig_id: string; gig_title: string; author_name: string | null; region_name: string | null }[]
  }> = {}

  for (const gp of (gigPieces || []) as any[]) {
    const pid = gp.piece_id
    if (!grouped[pid]) {
      grouped[pid] = {
        piece_id: pid,
        piece_title: gp.piece?.title || '',
        composer_name_ko: gp.piece?.composer?.name_ko || null,
        composer_name_en: gp.piece?.composer?.name_en || null,
        period: gp.piece?.period || null,
        teams: [],
      }
    }
    const gig = gp.gig
    // Avoid duplicate gig entries
    if (!grouped[pid].teams.some(t => t.gig_id === gig.id)) {
      grouped[pid].teams.push({
        gig_id: gig.id,
        gig_title: gig.title,
        author_name: gig.author?.display_name || null,
        region_name: Array.isArray(gig.region) ? gig.region[0]?.name || null : gig.region?.name || null,
      })
    }
  }

  const data = Object.values(grouped)
    .map(g => ({ ...g, team_count: g.teams.length }))
    .sort((a, b) => b.team_count - a.team_count)
    .slice(0, limit)

  return NextResponse.json({ data })
}
