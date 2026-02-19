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
}

export interface FetchGigsResult {
  data: GigListItem[]
  hasMore: boolean
}

export async function fetchGigs({
  gigType,
  instrumentName,
  regionName,
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

  // Step 3: 메인 쿼리
  let query = supabase
    .from('gigs')
    .select(`
      id, gig_type, status, title, is_paid, is_project, piece_name, composer_id, event_date, expires_at, view_count, min_skill_level,
      region:regions(name),
      author:user_profiles!gigs_user_id_fkey(display_name),
      instruments:gig_instruments(
        instrument:instruments(name)
      )
    `)
    .in('status', includeExpired ? ['active', 'closed', 'expired'] : ['active'])

  if (gigType) query = query.eq('gig_type', gigType)
  if (isProject === true) query = query.eq('is_project', true)
  if (regionId) query = query.eq('region_id', regionId)
  if (allowedGigIds) query = query.in('id', allowedGigIds)
  if (searchQuery?.trim()) query = query.ilike('title', `%${searchQuery.trim()}%`)

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
    id: user.id,
    display_name: profileData.displayName,
    bio: profileData.bio || null,
    region_id: profileData.regionId || null,
    updated_at: new Date().toISOString(),
  }
  if (profileData.avatarUrl !== undefined) {
    updateData.avatar_url = profileData.avatarUrl
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(updateData)
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
