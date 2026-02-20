// API: GET /api/tags (태그 조회)
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getTagsByCategory, getAllActiveTags } from '@/lib/supabase/pieces-queries'
import type { TagCategory } from '@/types/pieces'

/**
 * GET /api/tags
 * 태그 조회
 *
 * 쿼리 파라미터:
 * - category: 태그 카테고리 (period, genre, instrumentation, style, custom)
 *   (생략하면 모든 활성 태그 반환)
 *
 * 응답:
 * {
 *   data: Tag[]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') as TagCategory | null

    let tags

    if (category) {
      tags = await getTagsByCategory(category)
    } else {
      tags = await getAllActiveTags()
    }

    return NextResponse.json({
      data: tags,
    })
  } catch (error) {
    console.error('태그 조회 오류:', error)
    return NextResponse.json(
      { error: '태그 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}
