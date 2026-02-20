// API: GET /api/composers/{id}/pieces (작곡가별 곡 목록)

import { NextRequest, NextResponse } from 'next/server'
import { getComposerPieces } from '@/lib/supabase/pieces-queries'

/**
 * GET /api/composers/{id}/pieces
 * 작곡가별 곡 목록 조회
 *
 * 쿼리 파라미터:
 * - difficulty: 난이도 필터 (선택)
 * - limit: 한 페이지 개수 (기본값: 20)
 *
 * 응답: PaginatedResponse<PieceListItem>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const difficulty = searchParams.get('difficulty') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')

    const result = await getComposerPieces(params.id, {
      difficulty,
      limit,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('작곡가 곡 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '작곡가 곡 목록 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}
