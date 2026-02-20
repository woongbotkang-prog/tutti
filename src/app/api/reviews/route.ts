import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      application_id,
      score,
      comment,
      category_scores,
    } = body

    if (!application_id || !score || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (typeof score !== 'number' || score < 1 || score > 5) {
      return NextResponse.json(
        { error: 'Score must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (typeof comment !== 'string' || comment.trim().length < 2 || comment.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be 2 to 1000 characters' },
        { status: 400 }
      )
    }

    // Validate application exists and is accepted
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, gig_id, applicant_id, status, gig:gigs(user_id)')
      .eq('id', application_id)
      .single()

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Application must be accepted' },
        { status: 400 }
      )
    }

    // Check if user is part of the application
    const appGig = Array.isArray(application.gig) ? application.gig[0] : application.gig

    if (!appGig || !appGig.user_id) {
      return NextResponse.json(
        { error: 'Invalid application data' },
        { status: 400 }
      )
    }

    const isGigOwner = appGig.user_id === user.id
    const isApplicant = application.applicant_id === user.id

    if (!isGigOwner && !isApplicant) {
      return NextResponse.json(
        { error: 'Not authorized for this application' },
        { status: 403 }
      )
    }

    // Get reviewee ID
    const revieweeId = isGigOwner ? application.applicant_id : appGig.user_id

    // SECURITY FIX: Prevent self-review
    if (user.id === revieweeId) {
      return NextResponse.json(
        { error: 'Cannot review yourself' },
        { status: 400 }
      )
    }

    // Check if already reviewed
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('application_id', application_id)
      .eq('reviewer_id', user.id)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'Already reviewed this application' },
        { status: 400 }
      )
    }

    // Insert review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        application_id,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        score,
        comment: comment.trim(),
        is_blind: true,
        category_scores: category_scores || {},
      })
      .select()
      .single()

    if (reviewError) {
      return NextResponse.json(
        { error: reviewError.message },
        { status: 500 }
      )
    }

    // Update manner temperature via SECURITY DEFINER RPC.
    // This avoids direct updates blocked by DB trigger/RLS hardening.
    const { error: mannerError } = await supabase.rpc('apply_manner_temperature_from_review', {
      p_reviewee_id: revieweeId,
      p_score: score,
      p_review_id: review.id,
    })

    if (mannerError) {
      console.error('Failed to apply manner temperature via RPC:', mannerError)
    }

    // Check if both parties reviewed
    const { data: otherReview } = await supabase
      .from('reviews')
      .select('id, revealed_at')
      .eq('application_id', application_id)
      .eq('reviewer_id', revieweeId)
      .single()

    if (otherReview && otherReview.revealed_at === null) {
      // Both reviewed, reveal both reviews
      const now = new Date().toISOString()

      const { error: revealError } = await supabase
        .from('reviews')
        .update({ revealed_at: now })
        .eq('application_id', application_id)
        .in('reviewer_id', [user.id, revieweeId])

      if (revealError) {
        console.error('Failed to reveal reviews:', revealError)
      }

      // Send notification to other party
      const { data: otherUserProfile } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()

      await supabase
        .from('notifications')
        .insert({
          user_id: revieweeId,
          type: 'review_request',
          title: '리뷰가 공개됐어요',
          body: `${otherUserProfile?.display_name || '사용자'}님의 리뷰를 확인해 보세요.`,
          data: { application_id },
        })
    } else if (!otherReview) {
      // Other party hasn't reviewed yet, send notification
      const { data: reviewerProfile } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()

      await supabase
        .from('notifications')
        .insert({
          user_id: revieweeId,
          type: 'review_request',
          title: '리뷰를 기다리는 중이에요',
          body: `${reviewerProfile?.display_name || '사용자'}님의 리뷰를 남겨주세요.`,
          data: { application_id },
        })
    }

    return NextResponse.json({ data: review }, { status: 201 })
  } catch (error) {
    console.error('Review API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get reviews received
    const { data: receivedReviews, error: receivedError } = await supabase
      .from('reviews')
      .select(`
        id,
        application_id,
        reviewer_id,
        reviewee_id,
        score,
        comment,
        is_blind,
        revealed_at,
        created_at,
        reviewer:user_profiles!reviews_reviewer_id_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('reviewee_id', user.id)
      .order('created_at', { ascending: false })

    // Get reviews given
    const { data: givenReviews, error: givenError } = await supabase
      .from('reviews')
      .select(`
        id,
        application_id,
        reviewer_id,
        reviewee_id,
        score,
        comment,
        is_blind,
        revealed_at,
        created_at,
        reviewee:user_profiles!reviews_reviewee_id_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('reviewer_id', user.id)
      .order('created_at', { ascending: false })

    if (receivedError || givenError) {
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      received: receivedReviews,
      given: givenReviews,
    })
  } catch (error) {
    console.error('Review GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
