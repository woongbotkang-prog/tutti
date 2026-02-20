// API: GET /api/tags/autocomplete (태그 자동완성)

import { NextRequest, NextResponse } from 'next/server'
import { autocompleteTag } from '@/lib/supabase/pieces-queries'
import type { TagCategory } from '@/types/pieces'

/**
 * GET /api/tags/autocomplete
 * 태그 자동완성
 *
 * 쿼리 파라미터:
 * - query: 검색어 (필수)
 * - category: 카테고리 (선택, period|genre|instrumentation|style|custom)
 *
 * 응답:
 * {
 *   data: Array<{
 *     id: string
 *     name: string
 *     name_ko: string | null
 *     category: TagCategory
 *     color_code: string | null
 *   }>
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const category = searchParams.get('category') as TagCategory | null

    if (!query || query.length < 1) {
      return NextResponse.json(
        { error: '검색어는 1글자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    const tags = await autocompleteTag(query, category || undefined)

    return NextResponse.json({
      data: tags,
    })
  } catch (error) {
    console.error('태그 자동완성 오류:', error)
    return NextResponse.json(
      { error: '태그 자동완성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
