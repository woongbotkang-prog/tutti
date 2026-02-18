import { createClient } from './client'
import type { Gig, Application, UserProfile } from '@/types'

// ============================================================
// GIGS
// ============================================================

export async function fetchGigs({
  gigType,
  instrumentName,
  regionName,
  page = 0,
  limit = 20,
}: {
  gigType?: 'hiring' | 'seeking'
  instrumentName?: string
  regionName?: string
  page?: number
  limit?: number
}) {
  const supabase = createClient()
  let query = supabase
    .from('gigs')
    .select(`
      *,
      author:user_profiles!gigs_user_id_fkey(id, display_name, avatar_url, manner_temperature),
      region:regions(id, name),
      instruments:gig_instruments(
        id, count_needed,
        instrument:instruments(id, name)
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  if (gigType) query = query.eq('gig_type', gigType)
  if (regionName) {
    const { data: region } = await supabase.from('regions').select('id').eq('name', regionName).single()
    if (region) query = query.eq('region_id', region.id)
  }

  const { data, error } = await query
  if (error) throw error
  return data
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
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      display_name: profileData.displayName,
      bio: profileData.bio || null,
      region_id: profileData.regionId || null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}
