// TUTTI Platform - Piece & Tag Types
// 곡(Piece) 관련 모든 타입 정의

// ============================================================
// ENUMS & TYPE ALIASES
// ============================================================

export type PiecePeriod = 'baroque' | 'classical' | 'romantic' | 'modern' | 'contemporary'
export type PieceDifficulty = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'professional'
export type TagCategory = 'period' | 'genre' | 'instrumentation' | 'style' | 'custom'

// ============================================================
// PIECES
// ============================================================

export interface Piece {
  id: string
  title: string
  alternative_titles?: string[] // 별명 배열
  composer_id: string | null
  period: PiecePeriod | null
  duration_minutes: number | null
  difficulty_level: PieceDifficulty | null
  premiere_year: number | null
  key_signature: string | null // 조성 (C major, F# minor)
  instrumentation: string | null // 편성 설명
  movement_count: number | null
  is_orchestral: boolean
  is_chamber: boolean
  is_solo: boolean
  description: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PieceWithDetails extends Piece {
  composer_name: string | null
  composer_name_ko: string | null
  composer_period: string | null
  tags: Tag[]
}

export interface PieceListItem {
  id: string
  title: string
  composer: {
    id: string
    name_en: string
    name_ko: string | null
    period: string | null
  } | null
  period: PiecePeriod | null
  difficulty_level: PieceDifficulty | null
  duration_minutes: number | null
  tags: Array<{
    id: string
    name: string
    name_ko: string | null
    category: TagCategory
  }>
}

// ============================================================
// TAGS
// ============================================================

export interface Tag {
  id: string
  name: string
  name_ko: string | null
  category: TagCategory
  description: string | null
  color_code: string | null
  icon_name: string | null
  sort_order: number
  is_system: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PieceTag {
  id: string
  piece_id: string
  tag_id: string
  created_at: string
  piece?: Piece
  tag?: Tag
}

// ============================================================
// GIG PIECES (공고-곡 관계)
// ============================================================

export interface GigPiece {
  id: string
  gig_id: string
  piece_id: string
  order_index: number
  notes: string | null
  required_skill_level: string | null
  min_performers: number | null
  max_performers: number | null
  created_at: string
  updated_at: string
  piece?: PieceWithDetails
}

export interface GigWithPieces {
  id: string
  title: string
  gig_type: 'hiring' | 'seeking'
  status: 'active' | 'paused' | 'closed' | 'expired'
  pieces: GigPiece[]
  gig_pieces_count: number
  is_multi_piece: boolean
  [key: string]: unknown
}

// ============================================================
// USER REPERTOIRE (강화)
// ============================================================

export interface UserRepertoireEnhanced {
  id: string
  user_id: string
  piece_id?: string | null // 신규: 자동화된 곡 선택
  composer_id?: string | null // 레거시
  composer_name: string
  piece_name: string
  genre_tag_id?: string | null // 레거시
  difficulty_level?: PieceDifficulty | null // 신규
  performance_ready: boolean
  is_favorite?: boolean // 신규
  last_performed_at?: string | null // 신규
  notes?: string | null
  created_at: string
  updated_at?: string
  piece?: Piece // 신규 관계
}

// ============================================================
// ORGANIZATION MUSIC PREFERENCES (신규)
// ============================================================

export interface OrganizationMusicPreferences {
  id: string
  org_user_id: string
  preferred_periods: PiecePeriod[]
  preferred_genres: string[]
  min_difficulty: PieceDifficulty | null
  max_difficulty: PieceDifficulty | null
  music_style_description: string | null
  repertoire_focus: string | null
  favorite_composers: string[] // composer UUIDs
  created_at: string
  updated_at: string
}

// ============================================================
// API REQUEST TYPES
// ============================================================

export interface CreatePieceRequest {
  title: string
  alternative_titles?: string[]
  composer_id: string
  period?: PiecePeriod
  duration_minutes?: number
  difficulty_level?: PieceDifficulty
  premiere_year?: number
  key_signature?: string
  instrumentation?: string
  movement_count?: number
  is_orchestral?: boolean
  is_chamber?: boolean
  is_solo?: boolean
  description?: string
  notes?: string
  tag_ids?: string[]
}

export interface UpdatePieceRequest {
  title?: string
  alternative_titles?: string[]
  period?: PiecePeriod | null
  duration_minutes?: number | null
  difficulty_level?: PieceDifficulty | null
  premiere_year?: number | null
  key_signature?: string | null
  instrumentation?: string | null
  movement_count?: number | null
  is_orchestral?: boolean
  is_chamber?: boolean
  is_solo?: boolean
  description?: string | null
  notes?: string | null
  tag_ids?: string[]
}

export interface CreateTagRequest {
  name: string
  name_ko?: string
  category: TagCategory
  description?: string
  color_code?: string
  icon_name?: string
}

export interface CreateGigPieceRequest {
  piece_id: string
  order_index?: number
  notes?: string
  required_skill_level?: string
  min_performers?: number
  max_performers?: number
}

export interface UpdateGigPieceRequest {
  order_index?: number
  notes?: string
  required_skill_level?: string
  min_performers?: number
  max_performers?: number
}

export interface PieceSearchRequest {
  query?: string // 곡명, 작곡가명 자유 검색
  periods?: PiecePeriod[]
  composers?: string[] // composer IDs
  tags?: string[] // tag IDs
  difficulty?: PieceDifficulty
  isOrchestral?: boolean
  isChamber?: boolean
  isSolo?: boolean
  sortBy?: 'relevance' | 'title' | 'difficulty' | 'popularity'
  page?: number
  limit?: number
}

export interface AddPieceToRepertoireRequest {
  piece_id: string
  difficulty_level?: PieceDifficulty
  performance_ready?: boolean
  is_favorite?: boolean
  notes?: string
}

export interface SetOrganizationMusicPreferencesRequest {
  preferred_periods?: PiecePeriod[]
  preferred_genres?: string[]
  min_difficulty?: PieceDifficulty | null
  max_difficulty?: PieceDifficulty | null
  music_style_description?: string | null
  repertoire_focus?: string | null
  favorite_composers?: string[]
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

export interface PieceSearchResponse extends PaginatedResponse<PieceListItem> {}

export interface CreatePieceResponse extends PieceWithDetails {}

export interface GigPiecesResponse {
  data: GigPiece[]
  gig_pieces_count: number
  is_multi_piece: boolean
}

export interface ComposerAutocompleteResponse {
  data: Array<{
    id: string
    name_en: string
    name_ko: string | null
    name_original: string | null
    period: string | null
    birth_year: number | null
    death_year: number | null
    nationality: string | null
  }>
}

export interface TagAutocompleteResponse {
  data: Array<{
    id: string
    name: string
    name_ko: string | null
    category: TagCategory
    color_code: string | null
  }>
}

// ============================================================
// MATCHING & RECOMMENDATION
// ============================================================

export interface GigMatchScore {
  gig_id: string
  user_id: string
  match_score: number // 0-100
  tag_match_score: number // 40% weight
  difficulty_match_score: number // 30% weight
  composer_match_score: number // 20% weight
  period_match_score: number // 10% weight
  match_reasons: string[]
}

export interface RecommendedGigResponse {
  id: string
  title: string
  gig_type: 'hiring' | 'seeking'
  status: string
  pieces: Array<{
    id: string
    title: string
    composer: { name_en: string } | null
    period: string | null
    difficulty_level: string | null
  }>
  match_score: number
  match_reasons: string[]
  region?: { name: string } | null
  event_date?: string | null
}

export interface RecommendedUserResponse {
  id: string
  display_name: string
  avatar_url: string | null
  manner_temperature: number
  primary_instrument?: string
  match_score: number
  match_reasons: string[]
  region?: { name: string } | null
}

// ============================================================
// COMPOSER (기존 타입 확장)
// ============================================================

export interface ComposerForPiece {
  id: string
  name_en: string
  name_ko: string | null
  name_original: string | null
  period: PiecePeriod | null
  nationality: string | null
  birth_year: number | null
  death_year: number | null
  is_active: boolean
}
