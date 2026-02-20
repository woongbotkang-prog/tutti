export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const q = searchParams.get('q') || ''
  const period = searchParams.get('period') || null
  const difficulty = searchParams.get('difficulty') || null
  const composerId = searchParams.get('composer_id') || null
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  const mapPieceRows = (rows: any[] | null | undefined) =>
    (rows || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      period: row.period,
      difficulty_level: row.difficulty_level,
      composer_name: row.composer_name ?? row.composer?.name ?? null,
      composer_name_ko: row.composer_name_ko ?? row.composer?.name_ko ?? null,
    }))

  if (!q && !period && !difficulty && !composerId) {
    const { data, error } = await supabase
      .from('pieces')
      .select(`
        id, title, period, difficulty_level, duration_minutes,
        composer:composers(id, name, name_ko, period)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const mapped = mapPieceRows(data)
    return NextResponse.json({ data: mapped, total: mapped.length })
  }

  const { data, error } = await supabase.rpc('search_pieces', {
    search_query: q || '',
    filter_period: period,
    filter_difficulty: difficulty,
    filter_composer_id: composerId,
    result_limit: limit,
  })

  if (!error) {
    const mapped = mapPieceRows(data)
    return NextResponse.json({ data: mapped, total: mapped.length })
  }

  const baseQuery = () => {
    const query = supabase
      .from('pieces')
      .select(`
        id, title, period, difficulty_level, duration_minutes,
        composer:composers(id, name, name_ko, period)
      `)

    if (period) query.eq('period', period)
    if (difficulty) query.eq('difficulty_level', difficulty)
    if (composerId) query.eq('composer_id', composerId)
    return query
  }

  let fallbackRows: any[] = []
  if (q) {
    const [titleRes, composerRes] = await Promise.all([
      baseQuery().ilike('title', `%${q}%`).limit(limit),
      supabase
        .from('composers')
        .select('id')
        .or(`name.ilike.%${q}%,name_ko.ilike.%${q}%`)
        .limit(limit),
    ])

    if (titleRes.error) {
      return NextResponse.json({ error: titleRes.error.message }, { status: 500 })
    }

    fallbackRows = titleRes.data || []

    const composerIds = (composerRes.data || []).map((c: { id: string }) => c.id)
    if (composerIds.length > 0) {
      const composerPieceRes = await baseQuery().in('composer_id', composerIds).limit(limit)
      if (composerPieceRes.error) {
        return NextResponse.json({ error: composerPieceRes.error.message }, { status: 500 })
      }
      const merged = new Map<string, any>()
      for (const row of fallbackRows) merged.set(row.id, row)
      for (const row of composerPieceRes.data || []) merged.set(row.id, row)
      fallbackRows = Array.from(merged.values())
    }
  } else {
    const fallbackRes = await baseQuery().limit(limit)
    if (fallbackRes.error) {
      return NextResponse.json({ error: fallbackRes.error.message }, { status: 500 })
    }
    fallbackRows = fallbackRes.data || []
  }

  const mapped = mapPieceRows(fallbackRows).slice(0, limit)
  return NextResponse.json({ data: mapped, total: mapped.length })
}
