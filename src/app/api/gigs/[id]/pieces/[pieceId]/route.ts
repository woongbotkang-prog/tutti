// API: PATCH /api/gigs/{gigId}/pieces/{pieceId} (공고-곡 업데이트)
// API: DELETE /api/gigs/{gigId}/pieces/{pieceId} (공고에서 곡 제거)

import { NextRequest, NextResponse } from 'next/server'
import {
  updateGigPiece,
  removePieceFromGig,
} from '@/lib/supabase/pieces-queries'
import type { UpdateGigPieceRequest } from '@/types/pieces'

/**
 * PATCH /api/gigs/{gigId}/pieces/{pieceId}
 * 공고-곡 업데이트
 *
 * 요청 본문: UpdateGigPieceRequest
 * 응답: GigPiece
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; pieceId: string } }
) {
  try {
    const body = (await request.json()) as UpdateGigPieceRequest

    const gigPiece = await updateGigPiece(params.id, params.pieceId, body)

    return NextResponse.json(gigPiece)
  } catch (error: any) {
    console.error('공고-곡 업데이트 오류:', error)

    if (error.message.includes('로그인')) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    if (error.message.includes('권한')) {
      return NextResponse.json(
        { error: '공고 수정 권한이 없습니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: '공고-곡 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/gigs/{gigId}/pieces/{pieceId}
 * 공고에서 곡 제거
 *
 * 응답: 204 No Content
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; pieceId: string } }
) {
  try {
    await removePieceFromGig(params.id, params.pieceId)

    return NextResponse.json(null, { status: 204 })
  } catch (error: any) {
    console.error('공고에서 곡 제거 오류:', error)

    if (error.message.includes('로그인')) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    if (error.message.includes('권한')) {
      return NextResponse.json(
        { error: '공고 수정 권한이 없습니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: '공고에서 곡 제거에 실패했습니다.' },
      { status: 500 }
    )
  }
}
