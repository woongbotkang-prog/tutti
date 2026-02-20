// API: GET /api/gigs/{gigId}/pieces (공고 곡 목록 조회)
// API: POST /api/gigs/{gigId}/pieces (공고에 곡 추가)

import { NextRequest, NextResponse } from 'next/server'
import {
  getGigPieces,
  addPieceToGig,
} from '@/lib/supabase/pieces-queries'
import type { CreateGigPieceRequest } from '@/types/pieces'

/**
 * GET /api/gigs/{gigId}/pieces
 * 공고의 곡 목록 조회
 *
 * 응답: GigPiecesResponse
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pieces = await getGigPieces(params.id)

    return NextResponse.json({
      data: pieces,
      gig_pieces_count: pieces.length,
      is_multi_piece: pieces.length > 1,
    })
  } catch (error) {
    console.error('공고 곡 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '공고 곡 목록 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gigs/{gigId}/pieces
 * 공고에 곡 추가
 *
 * 요청 본문:
 * {
 *   pieces: CreateGigPieceRequest[]
 * }
 *
 * 응답: GigPiecesResponse
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const pieces = body.pieces as CreateGigPieceRequest[]

    if (!Array.isArray(pieces) || pieces.length === 0) {
      return NextResponse.json(
        { error: '최소 1개 이상의 곡이 필요합니다.' },
        { status: 400 }
      )
    }

    // 곡 ID 검증
    if (!pieces.every((p) => p.piece_id)) {
      return NextResponse.json(
        { error: '모든 곡은 piece_id를 가져야 합니다.' },
        { status: 400 }
      )
    }

    const gigPieces = await addPieceToGig(params.id, pieces)

    return NextResponse.json(
      {
        data: gigPieces,
        gig_pieces_count: gigPieces.length,
        is_multi_piece: gigPieces.length > 1,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('공고 곡 추가 오류:', error)

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
      { error: '공고 곡 추가에 실패했습니다.' },
      { status: 500 }
    )
  }
}
