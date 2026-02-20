export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/matching
 * Returns matching gigs for the current user
 * Calls the RPC function find_matching_gigs
 *
 * Response:
 * {
 *   data: Array<{
 *     gig_id: string
 *     title: string
 *     match_score: number (0-100)
 *     matching_factors: string[]
 *   }>
 * }
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call find_matching_gigs RPC function
    try {
      const { data, error } = await supabase.rpc('find_matching_gigs', {
        target_user_id: user.id,
        max_results: 10,
      })

      if (error) {
        console.warn('find_matching_gigs RPC error:', error)

        if (error.code === 'PGRST202' || error.message?.includes('find_matching_gigs')) {
          return NextResponse.json(
            { error: '추천 기능이 아직 준비되지 않았습니다.', code: 'MATCHING_NOT_READY' },
            { status: 503 }
          )
        }

        return NextResponse.json(
          { error: '추천 공고를 불러오는 중 오류가 발생했습니다.', code: 'MATCHING_RPC_FAILED' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        data: data || [],
      })
    } catch (rpcError) {
      console.warn('RPC call error:', rpcError)
      return NextResponse.json(
        { error: '추천 공고를 불러오는 중 오류가 발생했습니다.', code: 'MATCHING_RPC_EXCEPTION' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Matching API error:', error)
    return NextResponse.json(
      { error: '추천 공고를 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}
