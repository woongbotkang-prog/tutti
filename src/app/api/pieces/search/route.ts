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

  if (!q && !period && !difficulty && !composerId) {
    // 쿼리 없으면 최근 추가된 곡 반환
    const { data, error } = await supabase
      .from('pieces')
      .select(`
        id, title, period, difficulty_level, duration_minutes,
        composer:composers(id, name, name_ko, period)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, total: data?.length || 0 })
  }

  // RPC 함수로 전문검색 (tsvector + pg_trgm)
  const { data, error } = await supabase.rpc('search_pieces', {
    search_query: q || '',
    filter_period: period,
    filter_difficulty: difficulty,
    filter_composer_id: composerId,
    result_limit: limit,
  })

  if (error) {
    // RPC가 아직 없으면 폴백: ILIKE 검색
    const query = supabase
      .from('pieces')
      .select(`
        id, title, period, difficulty_level, duration_minutes,
        composer:composers(id, name, name_ko, period)
      `)

    if (q) {
      query.or(`title.ilike.%${q}%,composers.name.ilike.%${q}%,composers.name_ko.ilike.%${q}%`)
    }
    if (period) query.eq('period', period)
    if (difficulty) query.eq('difficulty_level', difficulty)
    if (composerId) query.eq('composer_id', composerId)

    const { data: fallbackData, error: fallbackError } = await query.limit(limit)

    if (fallbackError) return NextResponse.json({ error: fallbackError.message }, { status: 500 })
    return NextResponse.json({ data: fallbackData, total: fallbackData?.length || 0 })
  }

  return NextResponse.json({ data, total: data?.length || 0 })
}
