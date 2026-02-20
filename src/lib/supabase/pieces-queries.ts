// TUTTI Platform - Piece & Tag Queries
// 곡, 태그, 공고-곡 관련 Supabase 쿼리 함수

import { createClient } from './client'
import type {
  Piece,
  PieceWithDetails,
  PieceListItem,
  Tag,
  GigPiece,
  GigWithPieces,
  UserRepertoireEnhanced,
  OrganizationMusicPreferences,
  CreatePieceRequest,
  UpdatePieceRequest,
  PieceSearchRequest,
  PaginatedResponse,
  ComposerAutocompleteResponse,
  TagAutocompleteResponse,
  GigMatchScore,
  RecommendedGigResponse,
} from '@/types/pieces'

// ============================================================
// PIECES CRUD
// ============================================================

/**
 * 곡 생성
 */
export async function createPiece(
  data: CreatePieceRequest
): Promise<PieceWithDetails> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  // 곡 기본 정보 생성
  const { data: piece, error: pieceError } = await supabase
    .from('pieces')
    .insert({
      title: data.title,
      alternative_titles: data.alternative_titles || [],
      composer_id: data.composer_id,
      period: data.period,
      duration_minutes: data.duration_minutes,
      difficulty_level: data.difficulty_level,
      premiere_year: data.premiere_year,
      key_signature: data.key_signature,
      instrumentation: data.instrumentation,
      movement_count: data.movement_count,
      is_orchestral: data.is_orchestral ?? false,
      is_chamber: data.is_chamber ?? false,
      is_solo: data.is_solo ?? false,
      description: data.description,
      notes: data.notes,
    })
    .select(
      `
      id, title, alternative_titles, composer_id, period, duration_minutes,
      difficulty_level, premiere_year, key_signature, instrumentation,
      movement_count, is_orchestral, is_chamber, is_solo, description, notes,
      created_at, updated_at,
      composer:composers(id, name_en, name_ko, period)
      `
    )
    .single()

  if (pieceError) throw pieceError
  if (!piece) throw new Error('곡 생성 실패')

  // 태그 연결
  if (data.tag_ids && data.tag_ids.length > 0) {
    const tagInserts = data.tag_ids.map((tagId) => ({
      piece_id: piece.id,
      tag_id: tagId,
    }))

    const { error: tagError } = await supabase
      .from('piece_tags')
      .insert(tagInserts)

    if (tagError) console.error('태그 추가 중 오류:', tagError)
  }

  // 태그 데이터 포함하여 반환
  const tags = await getTagsForPiece(piece.id)

  return {
    ...piece,
    tags,
    composer_name: (piece.composer as any)?.name_en || null,
    composer_name_ko: (piece.composer as any)?.name_ko || null,
    composer_period: (piece.composer as any)?.period || null,
  } as PieceWithDetails
}

/**
 * 곡 조회 (상세 정보 포함)
 */
export async function getPieceById(id: string): Promise<PieceWithDetails | null> {
  const supabase = createClient()

  const { data: piece, error } = await supabase
    .from('pieces')
    .select(
      `
      id, title, alternative_titles, composer_id, period, duration_minutes,
      difficulty_level, premiere_year, key_signature, instrumentation,
      movement_count, is_orchestral, is_chamber, is_solo, description, notes,
      created_at, updated_at,
      composer:composers(id, name_en, name_ko, period)
      `
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  if (!piece) return null

  const tags = await getTagsForPiece(piece.id)

  return {
    ...piece,
    tags,
    composer_name: (piece.composer as any)?.name_en || null,
    composer_name_ko: (piece.composer as any)?.name_ko || null,
    composer_period: (piece.composer as any)?.period || null,
  } as PieceWithDetails
}

/**
 * 곡 수정
 */
export async function updatePiece(
  id: string,
  data: UpdatePieceRequest
): Promise<PieceWithDetails> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const updateData: Record<string, unknown> = {}

  // Optional 필드만 업데이트
  if (data.title !== undefined) updateData.title = data.title
  if (data.period !== undefined) updateData.period = data.period
  if (data.duration_minutes !== undefined) updateData.duration_minutes = data.duration_minutes
  if (data.difficulty_level !== undefined) updateData.difficulty_level = data.difficulty_level
  if (data.premiere_year !== undefined) updateData.premiere_year = data.premiere_year
  if (data.key_signature !== undefined) updateData.key_signature = data.key_signature
  if (data.instrumentation !== undefined) updateData.instrumentation = data.instrumentation
  if (data.movement_count !== undefined) updateData.movement_count = data.movement_count
  if (data.is_orchestral !== undefined) updateData.is_orchestral = data.is_orchestral
  if (data.is_chamber !== undefined) updateData.is_chamber = data.is_chamber
  if (data.is_solo !== undefined) updateData.is_solo = data.is_solo
  if (data.description !== undefined) updateData.description = data.description
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.alternative_titles !== undefined) updateData.alternative_titles = data.alternative_titles

  updateData.updated_at = new Date().toISOString()

  const { data: piece, error } = await supabase
    .from('pieces')
    .update(updateData)
    .eq('id', id)
    .select(
      `
      id, title, alternative_titles, composer_id, period, duration_minutes,
      difficulty_level, premiere_year, key_signature, instrumentation,
      movement_count, is_orchestral, is_chamber, is_solo, description, notes,
      created_at, updated_at,
      composer:composers(id, name_en, name_ko, period)
      `
    )
    .single()

  if (error) throw error
  if (!piece) throw new Error('곡 수정 실패')

  // 태그 업데이트
  if (data.tag_ids) {
    await supabase
      .from('piece_tags')
      .delete()
      .eq('piece_id', id)

    if (data.tag_ids.length > 0) {
      const tagInserts = data.tag_ids.map((tagId) => ({
        piece_id: id,
        tag_id: tagId,
      }))

      await supabase
        .from('piece_tags')
        .insert(tagInserts)
    }
  }

  const tags = await getTagsForPiece(piece.id)

  return {
    ...piece,
    tags,
    composer_name: (piece.composer as any)?.name_en || null,
    composer_name_ko: (piece.composer as any)?.name_ko || null,
    composer_period: (piece.composer as any)?.period || null,
  } as PieceWithDetails
}

/**
 * 곡 삭제
 */
export async function deletePiece(id: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const { error } = await supabase
    .from('pieces')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================================
// PIECES SEARCH & FILTERING
// ============================================================

/**
 * 곡 검색 (복합 필터)
 */
export async function searchPieces(
  params: PieceSearchRequest
): Promise<PaginatedResponse<PieceListItem>> {
  const supabase = createClient()

  const page = params.page || 1
  const limit = params.limit || 20
  const offset = (page - 1) * limit

  // 기본 쿼리
  let query = supabase
    .from('pieces')
    .select(
      `
      id, title, composer_id, period, difficulty_level, duration_minutes,
      composer:composers(id, name_en, name_ko, period),
      piece_tags(tag:tags(id, name, name_ko, category))
      `,
      { count: 'exact' }
    )

  // 검색어 필터 (tsvector 사용)
  if (params.query?.trim()) {
    // 검색어로 곡명 또는 작곡가명 검색
    const searchQuery = params.query.trim()
    query = query.or(
      `title.ilike.%${searchQuery}%,composer.name_en.ilike.%${searchQuery}%`
    )
  }

  // 시대 필터
  if (params.periods && params.periods.length > 0) {
    query = query.in('period', params.periods)
  }

  // 난이도 필터
  if (params.difficulty) {
    query = query.eq('difficulty_level', params.difficulty)
  }

  // 편성 필터
  if (params.isOrchestral === true) {
    query = query.eq('is_orchestral', true)
  }
  if (params.isChamber === true) {
    query = query.eq('is_chamber', true)
  }
  if (params.isSolo === true) {
    query = query.eq('is_solo', true)
  }

  // 정렬
  if (params.sortBy === 'title') {
    query = query.order('title', { ascending: true })
  } else if (params.sortBy === 'difficulty') {
    query = query.order('difficulty_level', { ascending: true })
  } else {
    // 기본: relevance (생성 순서)
    query = query.order('created_at', { ascending: false })
  }

  // 페이지네이션
  query = query.range(offset, offset + limit - 1)

  const { data: pieces, count, error } = await query

  if (error) throw error

  // 작곡가/태그 필터 적용 (클라이언트 사이드)
  let filtered = (pieces || []) as any[]

  if (params.composers && params.composers.length > 0) {
    filtered = filtered.filter((p) =>
      params.composers!.includes(p.composer?.id)
    )
  }

  if (params.tags && params.tags.length > 0) {
    filtered = filtered.filter((p) => {
      const pieceTags = p.piece_tags?.map((pt: any) => pt.tag?.id) || []
      return params.tags!.some((tagId) => pieceTags.includes(tagId))
    })
  }

  const items: PieceListItem[] = filtered.map((p) => ({
    id: p.id,
    title: p.title,
    composer: p.composer
      ? {
          id: p.composer.id,
          name_en: p.composer.name_en,
          name_ko: p.composer.name_ko,
          period: p.composer.period,
        }
      : null,
    period: p.period,
    difficulty_level: p.difficulty_level,
    duration_minutes: p.duration_minutes,
    tags: (p.piece_tags || []).map((pt: any) => ({
      id: pt.tag.id,
      name: pt.tag.name,
      name_ko: pt.tag.name_ko,
      category: pt.tag.category,
    })),
  }))

  return {
    data: items,
    total: count || 0,
    page,
    limit,
    hasNext: offset + limit < (count || 0),
  }
}

// ============================================================
// TAGS
// ============================================================

/**
 * 카테고리별 태그 조회
 */
export async function getTagsByCategory(category: string): Promise<Tag[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * 모든 활성 태그 조회
 */
export async function getAllActiveTags(): Promise<Tag[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * 태그 자동완성
 */
export async function autocompleteTag(
  query: string,
  category?: string
): Promise<TagAutocompleteResponse['data']> {
  const supabase = createClient()

  let dbQuery = supabase
    .from('tags')
    .select('id, name, name_ko, category, color_code')
    .eq('is_active', true)
    .ilike('name', `${query}%`)

  if (category) {
    dbQuery = dbQuery.eq('category', category)
  }

  const { data, error } = await dbQuery
    .order('sort_order', { ascending: true })
    .limit(20)

  if (error) throw error
  return data || []
}

/**
 * 곡의 태그 조회
 */
export async function getTagsForPiece(pieceId: string): Promise<Tag[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('piece_tags')
    .select('tag:tags(*)')
    .eq('piece_id', pieceId)

  if (error) throw error

  return (data || []).map((pt: any) => pt.tag)
}

// ============================================================
// GIG PIECES (공고-곡 관계)
// ============================================================

/**
 * 공고에 곡 추가
 */
export async function addPieceToGig(
  gigId: string,
  pieces: Array<{
    piece_id: string
    order_index?: number
    notes?: string
    required_skill_level?: string
    min_performers?: number
    max_performers?: number
  }>
): Promise<GigPiece[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  // 권한 검증: 공고 작성자 확인
  const { data: gig, error: gigError } = await supabase
    .from('gigs')
    .select('user_id')
    .eq('id', gigId)
    .single()

  if (gigError || !gig || gig.user_id !== user.id) {
    throw new Error('공고 수정 권한이 없습니다.')
  }

  // 기존 곡 삭제
  const { error: deleteError } = await supabase
    .from('gig_pieces')
    .delete()
    .eq('gig_id', gigId)

  if (deleteError) throw deleteError

  // 새 곡 추가
  const inserts = pieces.map((p, idx) => ({
    gig_id: gigId,
    piece_id: p.piece_id,
    order_index: p.order_index ?? idx,
    notes: p.notes || null,
    required_skill_level: p.required_skill_level || null,
    min_performers: p.min_performers || null,
    max_performers: p.max_performers || null,
  }))

  const { data, error } = await supabase
    .from('gig_pieces')
    .insert(inserts)
    .select(
      `
      id, gig_id, piece_id, order_index, notes, required_skill_level,
      min_performers, max_performers, created_at, updated_at,
      piece:pieces(id, title, composer_id, period, difficulty_level,
        composer:composers(id, name_en, name_ko),
        piece_tags(tag:tags(id, name, name_ko, category))
      )
      `
    )
    .order('order_index', { ascending: true })

  if (error) throw error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any) || []
}

/**
 * 공고의 곡 목록 조회
 */
export async function getGigPieces(gigId: string): Promise<GigPiece[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('gig_pieces')
    .select(
      `
      id, gig_id, piece_id, order_index, notes, required_skill_level,
      min_performers, max_performers, created_at, updated_at,
      piece:pieces(
        id, title, composer_id, period, difficulty_level, duration_minutes,
        is_orchestral, is_chamber, is_solo, description,
        composer:composers(id, name_en, name_ko, period),
        piece_tags(tag:tags(id, name, name_ko, category, color_code))
      )
      `
    )
    .eq('gig_id', gigId)
    .order('order_index', { ascending: true })

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((gp: any) => ({
    ...gp,
    piece: {
      ...gp.piece,
      tags: (gp.piece?.piece_tags || []).map((pt: any) => pt.tag),
    },
  })) as GigPiece[]
}

/**
 * 공고-곡 업데이트
 */
export async function updateGigPiece(
  gigId: string,
  gigPieceId: string,
  data: {
    order_index?: number
    notes?: string
    required_skill_level?: string
    min_performers?: number
    max_performers?: number
  }
): Promise<GigPiece> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  // 권한 검증
  const { data: gig } = await supabase
    .from('gigs')
    .select('user_id')
    .eq('id', gigId)
    .single()

  if (!gig || gig.user_id !== user.id) {
    throw new Error('공고 수정 권한이 없습니다.')
  }

  const { data: updated, error } = await supabase
    .from('gig_pieces')
    .update(data)
    .eq('id', gigPieceId)
    .eq('gig_id', gigId)
    .select(
      `
      id, gig_id, piece_id, order_index, notes, required_skill_level,
      min_performers, max_performers, created_at, updated_at,
      piece:pieces(
        id, title, composer_id, period, difficulty_level,
        composer:composers(id, name_en, name_ko),
        piece_tags(tag:tags(id, name, name_ko, category))
      )
      `
    )
    .single()

  if (error) throw error
  return updated as unknown as GigPiece
}

/**
 * 공고에서 곡 제거
 */
export async function removePieceFromGig(
  gigId: string,
  gigPieceId: string
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  // 권한 검증
  const { data: gig } = await supabase
    .from('gigs')
    .select('user_id')
    .eq('id', gigId)
    .single()

  if (!gig || gig.user_id !== user.id) {
    throw new Error('공고 수정 권한이 없습니다.')
  }

  const { error } = await supabase
    .from('gig_pieces')
    .delete()
    .eq('id', gigPieceId)
    .eq('gig_id', gigId)

  if (error) throw error
}

// ============================================================
// COMPOSER AUTOCOMPLETE
// ============================================================

/**
 * 작곡가 자동완성
 */
export async function autocompleteComposer(query: string): Promise<ComposerAutocompleteResponse['data']> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('composers')
    .select('id, name_en, name_ko, name_original, period, birth_year, death_year, nationality')
    .eq('is_active', true)
    .or(`name_en.ilike.%${query}%,name_ko.ilike.%${query}%`)
    .limit(20)

  if (error) throw error
  return data || []
}

/**
 * 작곡가별 곡 목록
 */
export async function getComposerPieces(
  composerId: string,
  params?: { difficulty?: string; limit?: number }
): Promise<PaginatedResponse<PieceListItem>> {
  const supabase = createClient()

  const limit = params?.limit || 20

  let query = supabase
    .from('pieces')
    .select(
      `
      id, title, period, difficulty_level, duration_minutes,
      composer:composers(id, name_en),
      piece_tags(tag:tags(id, name, name_ko, category))
      `,
      { count: 'exact' }
    )
    .eq('composer_id', composerId)

  if (params?.difficulty) {
    query = query.eq('difficulty_level', params.difficulty)
  }

  const { data: pieces, count, error } = await query
    .order('title', { ascending: true })
    .limit(limit)

  if (error) throw error

  const items: PieceListItem[] = (pieces || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    composer: p.composer,
    period: p.period,
    difficulty_level: p.difficulty_level,
    duration_minutes: p.duration_minutes,
    tags: (p.piece_tags || []).map((pt: any) => pt.tag),
  }))

  return {
    data: items,
    total: count || 0,
    page: 1,
    limit,
    hasNext: false,
  }
}

// ============================================================
// USER REPERTOIRE (강화)
// ============================================================

/**
 * 사용자 레퍼토리에 곡 추가
 */
export async function addPieceToUserRepertoire(
  pieceId: string,
  data: {
    difficulty_level?: string
    performance_ready?: boolean
    is_favorite?: boolean
    notes?: string
  }
): Promise<UserRepertoireEnhanced> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  // 곡 정보 조회
  const { data: piece, error: pieceError } = await supabase
    .from('pieces')
    .select('title, composer_id')
    .eq('id', pieceId)
    .single()

  if (pieceError || !piece) throw new Error('곡을 찾을 수 없습니다.')

  // 레퍼토리 추가
  const { data: repertoire, error } = await supabase
    .from('user_repertoire')
    .insert({
      user_id: user.id,
      piece_id: pieceId,
      piece_name: piece.title,
      composer_id: piece.composer_id,
      composer_name: '', // 작곡가명은 조인으로 조회
      difficulty_level: data.difficulty_level,
      performance_ready: data.performance_ready ?? false,
      is_favorite: data.is_favorite ?? false,
      notes: data.notes,
    })
    .select(
      `
      id, user_id, piece_id, piece_name, composer_id, composer_name,
      difficulty_level, performance_ready, is_favorite, notes,
      created_at, updated_at,
      piece:pieces(id, title, period, difficulty_level,
        composer:composers(id, name_en, name_ko)
      )
      `
    )
    .single()

  if (error) throw error
  return repertoire as unknown as UserRepertoireEnhanced
}

/**
 * 사용자 레퍼토리 조회
 */
export async function getUserRepertoire(params?: {
  performance_ready?: boolean
  is_favorite?: boolean
  limit?: number
  page?: number
}): Promise<PaginatedResponse<UserRepertoireEnhanced>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], total: 0, page: 1, limit: 20, hasNext: false }

  const page = params?.page || 1
  const limit = params?.limit || 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('user_repertoire')
    .select(
      `
      id, user_id, piece_id, piece_name, composer_id, composer_name,
      difficulty_level, performance_ready, is_favorite, notes,
      created_at, updated_at,
      piece:pieces(
        id, title, composer_id, period, difficulty_level, duration_minutes,
        composer:composers(id, name_en, name_ko),
        piece_tags(tag:tags(id, name, name_ko, category))
      )
      `,
      { count: 'exact' }
    )
    .eq('user_id', user.id)

  if (params?.performance_ready !== undefined) {
    query = query.eq('performance_ready', params.performance_ready)
  }

  if (params?.is_favorite !== undefined) {
    query = query.eq('is_favorite', params.is_favorite)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return {
    data: data as unknown as UserRepertoireEnhanced[],
    total: count || 0,
    page,
    limit,
    hasNext: offset + limit < (count || 0),
  }
}

// ============================================================
// ORGANIZATION MUSIC PREFERENCES
// ============================================================

/**
 * 단체 음악 선호도 설정
 */
export async function setOrganizationMusicPreferences(
  data: Omit<OrganizationMusicPreferences, 'id' | 'created_at' | 'updated_at'>
): Promise<OrganizationMusicPreferences> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const { data: prefs, error } = await supabase
    .from('organization_music_preferences')
    .upsert({
      ...data,
      org_user_id: user.id,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return prefs as OrganizationMusicPreferences
}

/**
 * 단체 음악 선호도 조회
 */
export async function getOrganizationMusicPreferences(): Promise<OrganizationMusicPreferences | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('organization_music_preferences')
    .select('*')
    .eq('org_user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return data as OrganizationMusicPreferences
}
