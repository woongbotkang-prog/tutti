// API: GET /api/pieces/{id} (곡 상세 조회)
// API: PATCH /api/pieces/{id} (곡 수정)
// API: DELETE /api/pieces/{id} (곡 삭제)

import { NextRequest, NextResponse } from 'next/server'
import {
  getPieceById,
  updatePiece,
  deletePiece,
} from '@/lib/supabase/pieces-queries'
import type { UpdatePieceRequest } from '@/types/pieces'

/**
 * GET /api/pieces/{id}
 * 곡 상세 조회
 *
 * 응답: PieceWithDetails
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const piece = await getPieceById(params.id)

    if (!piece) {
      return NextResponse.json(
        { error: '곡을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(piece)
  } catch (error) {
    console.error('곡 조회 오류:', error)
    return NextResponse.json(
      { error: '곡 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/pieces/{id}
 * 곡 수정
 *
 * 요청 본문: UpdatePieceRequest
 * 응답: PieceWithDetails
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await request.json()) as UpdatePieceRequest

    const piece = await updatePiece(params.id, body)

    return NextResponse.json(piece)
  } catch (error: any) {
    console.error('곡 수정 오류:', error)

    if (error.message.includes('로그인')) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: '곡 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/pieces/{id}
 * 곡 삭제
 *
 * 응답: 204 No Content
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deletePiece(params.id)

    return NextResponse.json(null, { status: 204 })
  } catch (error: any) {
    console.error('곡 삭제 오류:', error)

    if (error.message.includes('로그인')) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: '곡 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
