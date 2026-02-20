// API: GET /api/composers/autocomplete (작곡가 자동완성)
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { autocompleteComposer } from '@/lib/supabase/pieces-queries'

/**
 * GET /api/composers/autocomplete
 * 작곡가 자동완성
 *
 * 쿼리 파라미터:
 * - query: 검색어 (필수, 1글자 이상)
 *
 * 응답:
 * {
 *   data: Array<{
 *     id: string
 *     name_en: string
 *     name_ko: string | null
 *     name_original: string | null
 *     period: string | null
 *     birth_year: number | null
 *     death_year: number | null
 *     nationality: string | null
 *   }>
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')

    if (!query || query.length < 1) {
      return NextResponse.json(
        { error: '검색어는 1글자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    const composers = await autocompleteComposer(query)

    return NextResponse.json({
      data: composers,
    })
  } catch (error) {
    console.error('작곡가 자동완성 오류:', error)
    return NextResponse.json(
      { error: '작곡가 자동완성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
