// TUTTI Platform - TypeScript Types
// Based on db-schema.sql

// ============================================================
// ENUMS
// ============================================================

export type UserType = 'individual' | 'organization'

export type SkillLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'professional'

export type GigType = 'hiring' | 'seeking'

export type GigStatus = 'active' | 'paused' | 'closed' | 'expired'

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'

export type ChatRoomType = 'direct' | 'group'

export type NotificationType =
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'new_message'
  | 'gig_expiring'
  | 'review_request'
  | 'system'

// ============================================================
// MASTER DATA
// ============================================================

export interface Region {
  id: string
  name: string
  code: string
  created_at: string
  updated_at: string
}

export interface InstrumentCategory {
  id: string
  name: string
  display_order: number
  created_at: string
}

export interface Instrument {
  id: string
  category_id: string
  name: string
  code: string
  display_order: number
  is_active: boolean
  created_at: string
  category?: InstrumentCategory
}

export interface Composer {
  id: string
  name_ko: string | null
  name_en: string
  name_original: string | null
  period: string | null
  nationality: string | null
  birth_year: number | null
  death_year: number | null
  is_active: boolean
  created_at: string
}

export interface GenreTag {
  id: string
  name: string
  code: string
  category: string | null
  created_at: string
}

// ============================================================
// USER & PROFILE
// ============================================================

export interface UserProfile {
  id: string
  user_type: UserType
  display_name: string
  bio: string | null
  avatar_url: string | null
  phone: string | null
  region_id: string | null
  manner_temperature: number
  is_verified: boolean
  is_active: boolean
  last_active_at: string | null
  created_at: string
  updated_at: string
  region?: Region
}

export interface IndividualProfile {
  id: string
  user_id: string
  real_name: string | null
  birth_year: number | null
  gender: string | null
  education: string | null
  career_summary: string | null
  website_url: string | null
  social_links: Record<string, string> | null
  created_at: string
  updated_at: string
}

export interface OrganizationProfile {
  id: string
  user_id: string
  org_name: string
  org_type: string | null
  founded_year: number | null
  member_count: number | null
  website_url: string | null
  contact_email: string | null
  contact_phone: string | null
  created_at: string
  updated_at: string
}

export interface UserInstrument {
  id: string
  user_id: string
  instrument_id: string
  skill_level: SkillLevel
  is_primary: boolean
  years_of_experience: number | null
  created_at: string
  instrument?: Instrument
}

export interface UserRepertoire {
  id: string
  user_id: string
  composer_id: string | null
  composer_name: string
  piece_name: string
  genre_tag_id: string | null
  performance_ready: boolean
  notes: string | null
  created_at: string
  composer?: Composer
  genre_tag?: GenreTag
}

// ============================================================
// GIGS (공고)
// ============================================================

export interface Gig {
  id: string
  user_id: string
  gig_type: GigType
  status: GigStatus
  title: string
  description: string | null
  region_id: string | null
  is_online: boolean
  required_skill_level: SkillLevel | null
  min_skill_level: SkillLevel | null
  max_applicants: number | null
  current_applicants: number
  event_date: string | null
  event_date_flexible: boolean
  rehearsal_info: string | null
  compensation: string | null
  is_paid: boolean
  expires_at: string | null
  view_count: number
  created_at: string
  updated_at: string
  author?: UserProfile
  region?: Region
  instruments?: GigInstrument[]
  genre_tags?: GigGenreTag[]
}

export interface GigInstrument {
  id: string
  gig_id: string
  instrument_id: string
  count_needed: number
  notes: string | null
  instrument?: Instrument
}

export interface GigGenreTag {
  id: string
  gig_id: string
  genre_tag_id: string
  genre_tag?: GenreTag
}

// ============================================================
// APPLICATIONS (지원)
// ============================================================

export interface Application {
  id: string
  gig_id: string
  applicant_id: string
  status: ApplicationStatus
  message: string | null
  rejection_reason_code: string | null
  rejection_reason_text: string | null
  applied_at: string
  responded_at: string | null
  gig?: Gig
  applicant?: UserProfile
}

// ============================================================
// CHAT
// ============================================================

export interface ChatRoom {
  id: string
  application_id: string | null
  room_type: ChatRoomType
  name: string | null
  created_at: string
  participants?: ChatParticipant[]
  last_message?: ChatMessage
  application?: Application
}

export interface ChatParticipant {
  id: string
  room_id: string
  user_id: string
  joined_at: string
  last_read_at: string | null
  user?: UserProfile
}

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  content: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  sender?: UserProfile
}

// ============================================================
// REVIEWS & MANNER TEMPERATURE
// ============================================================

export interface Review {
  id: string
  application_id: string
  reviewer_id: string
  reviewee_id: string
  score: number
  comment: string | null
  is_blind: boolean
  revealed_at: string | null
  created_at: string
}

export interface MannerTemperatureLog {
  id: string
  user_id: string
  change_amount: number
  reason: string
  related_review_id: string | null
  created_at: string
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  data: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}

// ============================================================
// AUTH FORMS
// ============================================================

export interface SignUpFormData {
  email: string
  password: string
  passwordConfirm: string
  userType: UserType
  displayName: string
  regionId: string
}

export interface LoginFormData {
  email: string
  password: string
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
}

export interface ApiError {
  message: string
  code?: string
}
