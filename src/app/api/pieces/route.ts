// API: GET /api/pieces (곡 검색)
// API: POST /api/pieces (곡 생성)

import { NextRequest, NextResponse } from 'next/server'
import { searchPieces, createPiece } from '@/lib/supabase/pieces-queries'
import type { PieceSearchRequest, CreatePieceRequest } from '@/types/pieces'

/**
 * GET /api/pieces
 * 곡 검색 (복합 필터)
 *
 * 쿼리 파라미터:
 * - query: 곡명, 작곡가명 자유 검색
 * - periods: 시대 (baroque,classical,romantic,modern,contemporary)
 * - composers: 작곡가 ID (쉼표로 구분)
 * - tags: 태그 ID (쉼표로 구분)
 * - difficulty: 난이도 (beginner, elementary, intermediate, advanced, professional)
 * - isOrchestral: 관현악 여부
 * - isChamber: 실내악 여부
 * - isSolo: 독주 여부
 * - sortBy: 정렬 (relevance, title, difficulty, popularity)
 * - page: 페이지 (기본값: 1)
 * - limit: 한 페이지 개수 (기본값: 20)
 *
 * 응답: PaginatedResponse<PieceListItem>
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const searchRequest: PieceSearchRequest = {
      query: searchParams.get('query') || undefined,
      periods: searchParams
        .get('periods')
        ?.split(',')
        .filter(Boolean) as any,
      composers: searchParams
        .get('composers')
        ?.split(',')
        .filter(Boolean),
      tags: searchParams
        .get('tags')
        ?.split(',')
        .filter(Boolean),
      difficulty: searchParams.get('difficulty') as any,
      isOrchestral: searchParams.get('isOrchestral') === 'true' ? true : undefined,
      isChamber: searchParams.get('isChamber') === 'true' ? true : undefined,
      isSolo: searchParams.get('isSolo') === 'true' ? true : undefined,
      sortBy: (searchParams.get('sortBy') || 'relevance') as any,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    }

    const result = await searchPieces(searchRequest)

    return NextResponse.json(result)
  } catch (error) {
    console.error('곡 검색 오류:', error)
    return NextResponse.json(
      { error: '곡 검색에 실패했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pieces
 * 곡 생성
 *
 * 요청 본문: CreatePieceRequest
 * 응답: PieceWithDetails
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreatePieceRequest

    // 검증
    if (!body.title || !body.composer_id) {
      return NextResponse.json(
        { error: '곡명과 작곡가는 필수입니다.' },
        { status: 400 }
      )
    }

    const piece = await createPiece(body)

    return NextResponse.json(piece, { status: 201 })
  } catch (error: any) {
    console.error('곡 생성 오류:', error)

    if (error.message.includes('로그인')) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: '곡 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
