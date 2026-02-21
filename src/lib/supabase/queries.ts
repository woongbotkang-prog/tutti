import { createClient } from './client'
import type { Gig, Application, UserProfile, SkillLevel } from '@/types'

// ============================================================
// GIGS
// ============================================================

export type SortOption = 'latest' | 'expiring' | 'popular'

export interface FetchGigsParams {
  gigType?: 'hiring' | 'seeking'
  instrumentName?: string
  regionName?: string
  period?: string
  minSkillLevel?: string
  searchQuery?: string
  sortBy?: SortOption
  page?: number
  limit?: number
  includeExpired?: boolean
  isProject?: boolean
}

export interface GigListItem {
  id: string
  gig_type: 'hiring' | 'seeking'
  status: 'active' | 'paused' | 'closed' | 'expired'
  title: string
  is_paid: boolean
  is_project: boolean
  piece_name: string | null
  composer_id: string | null
  event_date: string | null
  expires_at: string | null
  view_count: number
  min_skill_level: string | null
  region: { name: string } | null
  author: { display_name: string } | null
  instruments: Array<{
    instrument: { name: string } | null
  }>
  gig_pieces?: Array<{
    piece: {
      title: string
      alternative_titles: string[] | null
      composer: { name: string; name_ko: string | null; name_en: string | null } | null
    } | null
  }>
}

export interface FetchGigsResult {
  data: GigListItem[]
  hasMore: boolean
}

export async function fetchGigs({
  gigType,
  instrumentName,
  regionName,
  period,
  minSkillLevel,
  searchQuery,
  sortBy = 'latest',
  page = 0,
  limit = 10,
  includeExpired = false,
  isProject,
}: FetchGigsParams = {}): Promise<FetchGigsResult> {
  const supabase = createClient()

  // Step 1: 악기 필터 — instrument name → gig IDs
  let allowedGigIds: string[] | null = null
  if (instrumentName && instrumentName !== '전체') {
    const { data: instrData } = await supabase
      .from('instruments')
      .select('id')
      .eq('name', instrumentName)
      .single()

    if (!instrData) return { data: [], hasMore: false }

    const { data: gigInstrData } = await supabase
      .from('gig_instruments')
      .select('gig_id')
      .eq('instrument_id', instrData.id)

    allowedGigIds = (gigInstrData ?? []).map((gi: { gig_id: string }) => gi.gig_id)
    if (allowedGigIds.length === 0) return { data: [], hasMore: false }
  }

  // Step 2: 지역 필터 — region name → region ID
  let regionId: string | null = null
  if (regionName && regionName !== '전체') {
    const { data: regionData } = await supabase
      .from('regions')
      .select('id')
      .eq('name', regionName)
      .single()
    regionId = regionData?.id ?? null
  }

  // Step 3: 시대 필터 — period로 gig_pieces를 통해 pieces 필터링
  let periodFilteredGigIds: string[] | null = null
  if (period) {
    const { data: gp } = await supabase
      .from('gig_pieces')
      .select('gig_id, piece:pieces(period)')

    if (gp && gp.length > 0) {
      periodFilteredGigIds = gp
        .filter((item: any) => item.piece?.period === period)
        .map((item: any) => item.gig_id)
      if (periodFilteredGigIds.length === 0) return { data: [], hasMore: false }
    }
  }

  // Step 4: 메인 쿼리
  let query = supabase
    .from('gigs')
    .select(`
      id, gig_type, status, title, is_paid, is_project, piece_name, composer_id, event_date, expires_at, view_count, min_skill_level,
      region:regions(name),
      author:user_profiles!gigs_user_id_fkey(display_name),
      instruments:gig_instruments(
        instrument:instruments(name)
      ),
      gig_pieces(
        piece:pieces(
          title,
          alternative_titles,
          composer:composers(name, name_ko, name_en)
        )
      )
    `)
    .in('status', includeExpired ? ['active', 'closed', 'expired'] : ['active'])

  if (gigType) query = query.eq('gig_type', gigType)
  if (isProject === true) query = query.eq('is_project', true)
  if (regionId) query = query.eq('region_id', regionId)
  if (allowedGigIds) query = query.in('id', allowedGigIds)
  if (periodFilteredGigIds) query = query.in('id', periodFilteredGigIds)

  // 검색: 제목 또는 곡 이름에서 검색
  // Supabase에서 OR 조건을 처리하기 위해 별도로 조회
  if (searchQuery?.trim()) {
    const searchTerm = `%${searchQuery.trim()}%`

    // 제목 또는 곡명 필터 - 두 개의 쿼리로 분리
    const { data: titleMatches } = await supabase
      .from('gigs')
      .select('id')
      .ilike('title', searchTerm)

    const { data: pieceMatches } = await supabase
      .from('gigs')
      .select('id')
      .ilike('piece_name', searchTerm)

    const searchMatchIds = new Set([
      ...(titleMatches ?? []).map(r => r.id),
      ...(pieceMatches ?? []).map(r => r.id),
    ])

    if (searchMatchIds.size === 0) return { data: [], hasMore: false }
    query = query.in('id', Array.from(searchMatchIds))
  }

  // 정렬
  if (sortBy === 'latest') {
    query = query.order('created_at', { ascending: false })
  } else if (sortBy === 'expiring') {
    query = query.not('expires_at', 'is', null).order('expires_at', { ascending: true })
  } else if (sortBy === 'popular') {
    query = query.order('view_count', { ascending: false })
  }

  // 페이지네이션
  query = query.range(page * limit, (page + 1) * limit - 1)

  const { data, error } = await query
  if (error) {
    console.error('Supabase gigs query error:', error)
    throw error
  }

  const result = (data ?? []) as unknown as GigListItem[]
  return { data: result, hasMore: result.length === limit }
}

export async function fetchGigById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('gigs')
    .select(`
      *,
      author:user_profiles!gigs_user_id_fkey(id, display_name, avatar_url, manner_temperature, region:regions(name)),
      region:regions(id, name),
      instruments:gig_instruments(
        id, count_needed, notes,
        instrument:instruments(id, name, category:instrument_categories(name))
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ============================================================
// APPLICATIONS
// ============================================================

export async function applyToGig(gigId: string, message?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  // 만료/마감된 공고 지원 차단
  const { data: gig, error: gigError } = await supabase
    .from('gigs')
    .select('id, status, expires_at, user_id')
    .eq('id', gigId)
    .single()

  if (gigError || !gig) throw new Error('공고를 찾을 수 없습니다.')
  if (gig.user_id === user.id) throw new Error('자신의 공고에는 지원할 수 없습니다.')
  if (gig.status !== 'active') throw new Error('마감된 공고에는 지원할 수 없습니다.')
  if (gig.expires_at && new Date(gig.expires_at) < new Date()) {
    throw new Error('마감 기한이 지난 공고입니다.')
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      gig_id: gigId,
      applicant_id: user.id,
      message: message || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('이미 지원한 공고입니다.')
    throw error
  }
  return data
}

export async function fetchMyApplications() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      gig:gigs(id, title, gig_type, status,
        author:user_profiles!gigs_user_id_fkey(display_name),
        region:regions(name)
      )
    `)
    .eq('applicant_id', user.id)
    .order('applied_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchGigApplications(gigId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      applicant:user_profiles!applications_applicant_id_fkey(
        id, display_name, avatar_url, manner_temperature,
        region:regions(name)
      )
    `)
    .eq('gig_id', gigId)
    .order('applied_at', { ascending: false })

  if (error) throw error
  return data
}

export async function respondToApplication(
  applicationId: string,
  status: 'accepted' | 'rejected',
  rejectionReasonCode?: string,
  rejectionReasonText?: string
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  // 권한 검증: 해당 지원서의 공고 작성자인지 확인
  const { data: application, error: fetchError } = await supabase
    .from('applications')
    .select('id, gig:gigs!applications_gig_id_fkey(user_id)')
    .eq('id', applicationId)
    .single()

  if (fetchError || !application) throw new Error('지원서를 찾을 수 없습니다.')

  const gig = application.gig as unknown as { user_id: string } | null
  if (!gig || gig.user_id !== user.id) {
    throw new Error('공고 작성자만 지원을 수락/거절할 수 있습니다.')
  }

  const { data, error } = await supabase
    .from('applications')
    .update({
      status,
      responded_at: new Date().toISOString(),
      rejection_reason_code: rejectionReasonCode || null,
      rejection_reason_text: rejectionReasonText || null,
    })
    .eq('id', applicationId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================
// MY GIGS (내가 올린 공고)
// ============================================================

export async function fetchMyGigs() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('gigs')
    .select(`
      id, gig_type, title, status, created_at, expires_at, view_count,
      region:regions(name),
      instruments:gig_instruments(
        instrument:instruments(name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ============================================================
// NOTIFICATIONS (알림)
// ============================================================

export async function fetchMyNotifications() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

export async function markNotificationRead(notificationId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
}

export async function markAllNotificationsRead() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) throw error
}

export async function fetchUnreadNotificationCount() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) throw error
  return count ?? 0
}

export async function fetchUnreadChatCount() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  // 내 채팅 참여 목록 조회
  const { data: participations } = await supabase
    .from('chat_participants')
    .select('room_id, last_read_at')
    .eq('user_id', user.id)

  if (!participations || participations.length === 0) return 0

  // N+1 최적화: 병렬 쿼리로 전환
  const counts = await Promise.all(
    participations.map(async (p) => {
      let query = supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', p.room_id)
        .eq('is_deleted', false)
        .neq('sender_id', user.id)

      if (p.last_read_at) {
        query = query.gt('created_at', p.last_read_at)
      }

      const { count } = await query
      return count || 0
    })
  )

  return counts.reduce((sum, c) => sum + c, 0)
}

// ============================================================
// USER PROFILE
// ============================================================

export async function fetchMyProfile() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      region:regions(id, name),
      instruments:user_instruments(
        id, skill_level, is_primary, years_of_experience,
        instrument:instruments(id, name)
      )
    `)
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertProfile(profileData: {
  displayName: string
  bio?: string
  regionId?: string
  avatarUrl?: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const updateData: Record<string, unknown> = {
    display_name: profileData.displayName,
    bio: profileData.bio || null,
    region_id: profileData.regionId || null,
    updated_at: new Date().toISOString(),
  }
  if (profileData.avatarUrl !== undefined) {
    updateData.avatar_url = profileData.avatarUrl
  }

  const { data: updated, error: updateError } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .maybeSingle()

  if (updateError) throw updateError
  if (updated) return updated

  const insertData: Record<string, unknown> = {
    id: user.id,
    user_type: (user.user_metadata?.user_type as string) || 'individual',
    ...updateData,
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function uploadAvatar(file: File): Promise<string> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const fileExt = file.name.split('.').pop()?.toLowerCase()
  const filePath = `${user.id}/avatar.${fileExt}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

export async function upsertUserInstruments(
  instruments: { name: string; skillLevel: SkillLevel; isPrimary: boolean }[]
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  // 기존 악기 삭제
  const { error: deleteError } = await supabase
    .from('user_instruments')
    .delete()
    .eq('user_id', user.id)
  if (deleteError) throw deleteError

  if (instruments.length === 0) return []

  // 악기 ID 조회
  const { data: instrumentRows, error: lookupError } = await supabase
    .from('instruments')
    .select('id, name')
    .in('name', instruments.map(i => i.name))
  if (lookupError) throw lookupError

  const nameToId = new Map(instrumentRows?.map(r => [r.name, r.id]) || [])

  const rows = instruments
    .filter(i => nameToId.has(i.name))
    .map(i => ({
      user_id: user.id,
      instrument_id: nameToId.get(i.name)!,
      skill_level: i.skillLevel,
      is_primary: i.isPrimary,
    }))

  if (rows.length === 0) return []

  const { data, error } = await supabase
    .from('user_instruments')
    .insert(rows)
    .select()
  if (error) throw error
  return data
}

// ============================================================
// MUSICIANS / PROFILES (공개 뮤지션 프로필)
// ============================================================

export interface MusicianListItem {
  id: string
  display_name: string
  avatar_url: string | null
  manner_temperature: number
  region: { name: string } | null
  instruments: Array<{
    skill_level: SkillLevel
    instrument: { name: string } | null
  }>
}

export interface FetchMusiciansParams {
  search?: string
  instrumentId?: string
  regionId?: string
  skillLevel?: SkillLevel
  page?: number
  limit?: number
}

export async function fetchMusicians({
  search,
  instrumentId,
  regionId,
  skillLevel,
  page = 0,
  limit = 20,
}: FetchMusiciansParams = {}): Promise<{
  data: MusicianListItem[]
  total: number
  hasMore: boolean
}> {
  const supabase = createClient()

  let query = supabase
    .from('user_profiles')
    .select(
      `
      id, display_name, avatar_url, manner_temperature,
      region:regions(name),
      instruments:user_instruments(
        skill_level,
        instrument:instruments(name)
      )
      `,
      { count: 'exact' }
    )
    .eq('is_active', true)

  // Search by name
  if (search && search.trim()) {
    query = query.ilike('display_name', `%${search}%`)
  }

  // Filter by region
  if (regionId) {
    query = query.eq('region_id', regionId)
  }

  // Filter by instrument and skill level
  if (instrumentId) {
    const { data: userIds } = await supabase
      .from('user_instruments')
      .select('user_id')
      .eq('instrument_id', instrumentId)

    const ids = userIds?.map(u => u.user_id) || []
    if (ids.length === 0) {
      return { data: [], total: 0, hasMore: false }
    }

    // Additional skill level filter
    if (skillLevel) {
      const { data: filteredUserIds } = await supabase
        .from('user_instruments')
        .select('user_id')
        .eq('instrument_id', instrumentId)
        .in('skill_level', [skillLevel, 'professional', 'advanced'])

      const filteredIds = filteredUserIds?.map(u => u.user_id) || []
      query = query.in('id', filteredIds.length > 0 ? filteredIds : ids)
    } else {
      query = query.in('id', ids)
    }
  }

  query = query.order('manner_temperature', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  const { data, error, count } = await query

  if (error) throw error

  const total = count || 0
  const hasMore = (page + 1) * limit < total

  // Type cast the data to handle array responses
  const typedData = (data || []) as any

  return {
    data: typedData,
    total,
    hasMore,
  }
}

export interface PublicMusicianProfile {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  manner_temperature: number
  is_verified: boolean
  region: { name: string } | null
  instruments: Array<{
    id: string
    skill_level: SkillLevel
    years_of_experience: number | null
    instrument: { id: string; name: string } | null
  }>
  repertoire: Array<{
    id: string
    composer_name: string
    piece_name: string
    performance_ready: boolean
    composer: { name_ko: string | null; name_en: string } | null
  }>
  reviews: Array<{
    id: string
    score: number
    comment: string | null
    created_at: string
    reviewer: { display_name: string; avatar_url: string | null } | null
  }>
}

export async function fetchPublicMusicianProfile(userId: string): Promise<PublicMusicianProfile | null> {
  const supabase = createClient()

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select(
      `
      id, display_name, avatar_url, bio, manner_temperature, is_verified,
      region:regions(name),
      instruments:user_instruments(
        id, skill_level, years_of_experience,
        instrument:instruments(id, name)
      ),
      repertoire:user_repertoire(
        id, composer_name, piece_name, performance_ready,
        composer:composers(name_ko, name_en)
      )
      `
    )
    .eq('id', userId)
    .eq('is_active', true)
    .single()

  if (profileError) return null

  // Fetch revealed reviews for this musician
  const { data: reviews } = await supabase
    .from('reviews')
    .select(
      `
      id, score, comment, created_at,
      reviewer:user_profiles!reviews_reviewer_id_fkey(display_name, avatar_url)
      `
    )
    .eq('reviewee_id', userId)
    .not('revealed_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  // Process reviews to handle array responses and convert to proper types
  const processedReviews = (reviews || []).map((review: any) => ({
    id: review.id,
    score: review.score,
    comment: review.comment,
    created_at: review.created_at,
    reviewer: Array.isArray(review.reviewer) ? review.reviewer[0] : review.reviewer,
  }))

  return {
    ...profile,
    reviews: processedReviews,
  } as unknown as PublicMusicianProfile
}
