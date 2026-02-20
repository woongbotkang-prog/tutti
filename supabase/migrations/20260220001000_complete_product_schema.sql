-- TUTTI Complete Product Schema Migration
-- Phase 1: Core Foundation
-- Created: 2026-02-20

-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- 1. PIECES TABLE (곡 전용 엔티티)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  alternative_titles TEXT[] DEFAULT ARRAY[]::TEXT[],
  composer_id UUID REFERENCES composers(id) ON DELETE SET NULL,
  period VARCHAR(50) CHECK (period IN ('baroque', 'classical', 'romantic', 'modern', 'contemporary')),
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'elementary', 'intermediate', 'advanced', 'professional')),
  duration_minutes INT,
  key_signature VARCHAR(30),
  instrumentation TEXT,
  movement_count INT,
  is_orchestral BOOLEAN DEFAULT false,
  is_chamber BOOLEAN DEFAULT false,
  is_solo BOOLEAN DEFAULT false,
  search_vector TSVECTOR,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_pieces_composer_title ON pieces(composer_id, title);
CREATE INDEX IF NOT EXISTS idx_pieces_period ON pieces(period);
CREATE INDEX IF NOT EXISTS idx_pieces_difficulty ON pieces(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_pieces_search_vector ON pieces USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_pieces_title_trgm ON pieces USING gin(title gin_trgm_ops);

-- tsvector auto-update trigger
CREATE OR REPLACE FUNCTION update_piece_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(
      (SELECT name FROM composers WHERE id = NEW.composer_id), ''
    )), 'A') ||
    setweight(to_tsvector('english', COALESCE(
      (SELECT name_ko FROM composers WHERE id = NEW.composer_id), ''
    )), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.period, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.key_signature, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_piece_search_vector ON pieces;
CREATE TRIGGER trigger_update_piece_search_vector
  BEFORE INSERT OR UPDATE ON pieces
  FOR EACH ROW EXECUTE FUNCTION update_piece_search_vector();

-- ============================================================================
-- 2. TAGS TABLE (통합 태그 시스템)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_ko VARCHAR(100),
  category VARCHAR(50) NOT NULL CHECK (category IN ('period', 'genre', 'instrumentation', 'style', 'custom')),
  description TEXT,
  color_code VARCHAR(7),
  icon_name VARCHAR(50),
  sort_order INT DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);

-- Seed system tags
INSERT INTO tags (name, name_ko, category, is_system, sort_order, color_code) VALUES
  ('baroque', '바로크', 'period', true, 1, '#8B4513'),
  ('classical', '고전', 'period', true, 2, '#DAA520'),
  ('romantic', '낭만', 'period', true, 3, '#DC143C'),
  ('modern', '근현대', 'period', true, 4, '#4169E1'),
  ('contemporary', '현대', 'period', true, 5, '#9932CC'),
  ('chamber', '실내악', 'genre', true, 10, '#2E8B57'),
  ('symphony', '교향곡', 'genre', true, 11, '#1E90FF'),
  ('concerto', '협주곡', 'genre', true, 12, '#FFD700'),
  ('solo', '독주', 'genre', true, 13, '#FF69B4'),
  ('sonata', '소나타', 'genre', true, 14, '#FF8C00'),
  ('quartet', '4중주', 'genre', true, 15, '#20B2AA'),
  ('trio', '3중주', 'genre', true, 16, '#9370DB'),
  ('duet', '2중주', 'genre', true, 17, '#87CEEB'),
  ('opera', '오페라', 'genre', true, 18, '#CD5C5C')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 3. PIECE_TAGS (곡-태그 다대다)
-- ============================================================================
CREATE TABLE IF NOT EXISTS piece_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_id UUID NOT NULL REFERENCES pieces(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(piece_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_piece_tags_piece ON piece_tags(piece_id);
CREATE INDEX IF NOT EXISTS idx_piece_tags_tag ON piece_tags(tag_id);

-- ============================================================================
-- 4. GIG_PIECES (공고-곡 다대다)
-- ============================================================================
CREATE TABLE IF NOT EXISTS gig_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  piece_id UUID REFERENCES pieces(id) ON DELETE SET NULL,
  text_input TEXT,
  order_index INT DEFAULT 0,
  notes TEXT,
  required_skill_level VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT gig_pieces_has_piece CHECK (piece_id IS NOT NULL OR text_input IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_gig_pieces_gig_piece ON gig_pieces(gig_id, piece_id) WHERE piece_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gig_pieces_gig ON gig_pieces(gig_id);
CREATE INDEX IF NOT EXISTS idx_gig_pieces_piece ON gig_pieces(piece_id);
CREATE INDEX IF NOT EXISTS idx_gig_pieces_order ON gig_pieces(gig_id, order_index);

-- ============================================================================
-- 5. GIGS TABLE EXTENSIONS
-- ============================================================================
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS gig_pieces_count INT DEFAULT 0;
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS is_multi_piece BOOLEAN DEFAULT false;

-- Auto-update gig_pieces_count
CREATE OR REPLACE FUNCTION update_gig_pieces_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE gigs SET
      gig_pieces_count = (SELECT COUNT(*) FROM gig_pieces WHERE gig_id = NEW.gig_id),
      is_multi_piece = (SELECT COUNT(*) > 1 FROM gig_pieces WHERE gig_id = NEW.gig_id)
    WHERE id = NEW.gig_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gigs SET
      gig_pieces_count = (SELECT COUNT(*) FROM gig_pieces WHERE gig_id = OLD.gig_id),
      is_multi_piece = (SELECT COUNT(*) > 1 FROM gig_pieces WHERE gig_id = OLD.gig_id)
    WHERE id = OLD.gig_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_gig_pieces_count ON gig_pieces;
CREATE TRIGGER trigger_update_gig_pieces_count
  AFTER INSERT OR UPDATE OR DELETE ON gig_pieces
  FOR EACH ROW EXECUTE FUNCTION update_gig_pieces_count();

-- ============================================================================
-- 6. ORGANIZATION MUSIC PREFERENCES (단체 음악적 정체성)
-- ============================================================================
CREATE TABLE IF NOT EXISTS organization_music_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  preferred_periods VARCHAR(50)[],
  preferred_genres VARCHAR(100)[],
  min_difficulty VARCHAR(50),
  max_difficulty VARCHAR(50),
  music_style_description TEXT,
  repertoire_focus TEXT,
  favorite_composers UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_music_pref_user ON organization_music_preferences(org_user_id);

-- ============================================================================
-- 7. USER_REPERTOIRE EXTENSIONS
-- ============================================================================
ALTER TABLE user_repertoire ADD COLUMN IF NOT EXISTS piece_id UUID REFERENCES pieces(id) ON DELETE SET NULL;
ALTER TABLE user_repertoire ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50);
ALTER TABLE user_repertoire ADD COLUMN IF NOT EXISTS last_performed_at TIMESTAMPTZ;
ALTER TABLE user_repertoire ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- ============================================================================
-- 8. USER_PROFILES EXTENSIONS (알림 설정)
-- ============================================================================
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"push": true, "email": true, "in_app": true}'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_periods TEXT[];

-- ============================================================================
-- 9. MATCHING_SCORES TABLE (매칭 캐시)
-- ============================================================================
CREATE TABLE IF NOT EXISTS matching_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  total_score FLOAT NOT NULL DEFAULT 0,
  instrument_score FLOAT DEFAULT 0,
  location_score FLOAT DEFAULT 0,
  piece_score FLOAT DEFAULT 0,
  difficulty_score FLOAT DEFAULT 0,
  schedule_score FLOAT DEFAULT 0,
  breakdown JSONB,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, gig_id)
);

CREATE INDEX IF NOT EXISTS idx_matching_scores_user ON matching_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_matching_scores_gig ON matching_scores(gig_id);
CREATE INDEX IF NOT EXISTS idx_matching_scores_calc ON matching_scores(calculated_at);

-- ============================================================================
-- 10. RLS POLICIES
-- ============================================================================

-- pieces
ALTER TABLE pieces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pieces_select_all" ON pieces;
CREATE POLICY "pieces_select_all" ON pieces FOR SELECT USING (true);
DROP POLICY IF EXISTS "pieces_insert_auth" ON pieces;
CREATE POLICY "pieces_insert_auth" ON pieces FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "pieces_update_auth" ON pieces;
CREATE POLICY "pieces_update_auth" ON pieces FOR UPDATE USING (auth.uid() IS NOT NULL);

-- tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tags_select_all" ON tags;
CREATE POLICY "tags_select_all" ON tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "tags_insert_auth" ON tags;
CREATE POLICY "tags_insert_auth" ON tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- piece_tags
ALTER TABLE piece_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "piece_tags_select_all" ON piece_tags;
CREATE POLICY "piece_tags_select_all" ON piece_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "piece_tags_insert_auth" ON piece_tags;
CREATE POLICY "piece_tags_insert_auth" ON piece_tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- gig_pieces
ALTER TABLE gig_pieces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gig_pieces_select_all" ON gig_pieces;
CREATE POLICY "gig_pieces_select_all" ON gig_pieces FOR SELECT USING (true);
DROP POLICY IF EXISTS "gig_pieces_insert_owner" ON gig_pieces;
CREATE POLICY "gig_pieces_insert_owner" ON gig_pieces FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM gigs WHERE id = gig_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "gig_pieces_update_owner" ON gig_pieces;
CREATE POLICY "gig_pieces_update_owner" ON gig_pieces FOR UPDATE
  USING (EXISTS (SELECT 1 FROM gigs WHERE id = gig_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "gig_pieces_delete_owner" ON gig_pieces;
CREATE POLICY "gig_pieces_delete_owner" ON gig_pieces FOR DELETE
  USING (EXISTS (SELECT 1 FROM gigs WHERE id = gig_id AND user_id = auth.uid()));

-- organization_music_preferences
ALTER TABLE organization_music_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_pref_select_all" ON organization_music_preferences;
CREATE POLICY "org_pref_select_all" ON organization_music_preferences FOR SELECT USING (true);
DROP POLICY IF EXISTS "org_pref_insert_own" ON organization_music_preferences;
CREATE POLICY "org_pref_insert_own" ON organization_music_preferences FOR INSERT
  WITH CHECK (org_user_id = auth.uid());
DROP POLICY IF EXISTS "org_pref_update_own" ON organization_music_preferences;
CREATE POLICY "org_pref_update_own" ON organization_music_preferences FOR UPDATE
  USING (org_user_id = auth.uid());

-- matching_scores
ALTER TABLE matching_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "matching_select_own" ON matching_scores;
CREATE POLICY "matching_select_own" ON matching_scores FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "matching_insert_auth" ON matching_scores;
CREATE POLICY "matching_insert_auth" ON matching_scores FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "matching_update_auth" ON matching_scores;
CREATE POLICY "matching_update_auth" ON matching_scores FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- 11. VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW pieces_with_details AS
SELECT
  p.id, p.title, p.alternative_titles, p.composer_id, p.period,
  p.difficulty_level, p.duration_minutes, p.key_signature,
  p.instrumentation, p.movement_count,
  p.is_orchestral, p.is_chamber, p.is_solo,
  p.description, p.notes, p.created_at, p.updated_at,
  c.name as composer_name,
  c.name_ko as composer_name_ko,
  c.period as composer_period,
  COALESCE(
    json_agg(
      json_build_object('id', t.id, 'name', t.name, 'name_ko', t.name_ko, 'category', t.category, 'color_code', t.color_code)
    ) FILTER (WHERE t.id IS NOT NULL), '[]'::json
  ) as tags
FROM pieces p
LEFT JOIN composers c ON p.composer_id = c.id
LEFT JOIN piece_tags pt ON p.id = pt.piece_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY p.id, c.id;

CREATE OR REPLACE VIEW gigs_with_pieces AS
SELECT
  g.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', gp.id,
        'piece_id', gp.piece_id,
        'title', COALESCE(p.title, gp.text_input),
        'composer_name', c.name,
        'composer_name_ko', c.name_ko,
        'period', p.period,
        'difficulty_level', COALESCE(gp.required_skill_level, p.difficulty_level),
        'text_input', gp.text_input,
        'notes', gp.notes,
        'order_index', gp.order_index
      ) ORDER BY gp.order_index
    ) FILTER (WHERE gp.id IS NOT NULL), '[]'::json
  ) as pieces
FROM gigs g
LEFT JOIN gig_pieces gp ON g.id = gp.gig_id
LEFT JOIN pieces p ON gp.piece_id = p.id
LEFT JOIN composers c ON p.composer_id = c.id
GROUP BY g.id;

-- ============================================================================
-- 12. RPC: SEARCH PIECES (전문검색)
-- ============================================================================

CREATE OR REPLACE FUNCTION search_pieces(
  search_query TEXT,
  filter_period VARCHAR(50) DEFAULT NULL,
  filter_difficulty VARCHAR(20) DEFAULT NULL,
  filter_composer_id UUID DEFAULT NULL,
  result_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  composer_id UUID,
  composer_name VARCHAR,
  composer_name_ko VARCHAR,
  period VARCHAR,
  difficulty_level VARCHAR,
  rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.title, p.composer_id,
    c.name as composer_name,
    c.name_ko as composer_name_ko,
    p.period,
    p.difficulty_level,
    ts_rank(p.search_vector, websearch_to_tsquery('english', search_query)) +
    similarity(p.title, search_query) AS rank
  FROM pieces p
  LEFT JOIN composers c ON p.composer_id = c.id
  WHERE
    (p.search_vector @@ websearch_to_tsquery('english', search_query)
     OR p.title % search_query
     OR c.name ILIKE '%' || search_query || '%'
     OR c.name_ko ILIKE '%' || search_query || '%')
    AND (filter_period IS NULL OR p.period = filter_period)
    AND (filter_difficulty IS NULL OR p.difficulty_level = filter_difficulty)
    AND (filter_composer_id IS NULL OR p.composer_id = filter_composer_id)
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 13. RPC: BASIC MATCHING (기본 매칭 알고리즘)
-- ============================================================================

CREATE OR REPLACE FUNCTION find_matching_gigs(
  p_user_id UUID,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  gig_id UUID,
  total_score FLOAT,
  instrument_score FLOAT,
  location_score FLOAT,
  piece_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_data AS (
    SELECT
      up.id, up.region_id,
      array_agg(DISTINCT ui.instrument_id) as instruments,
      array_agg(DISTINCT ur.piece_id) FILTER (WHERE ur.piece_id IS NOT NULL) as repertoire_pieces
    FROM user_profiles up
    LEFT JOIN user_instruments ui ON ui.user_id = up.id
    LEFT JOIN user_repertoire ur ON ur.user_id = up.id
    WHERE up.id = p_user_id
    GROUP BY up.id
  )
  SELECT
    g.id as gig_id,
    (
      -- Instrument match (35%)
      COALESCE(
        (SELECT COUNT(*)::float / GREATEST(COUNT(*) OVER(), 1)
         FROM gig_instruments gi
         WHERE gi.gig_id = g.id AND gi.instrument_id = ANY(ud.instruments))
      , 0) * 0.35
      +
      -- Location match (30%)
      CASE WHEN g.region_id = ud.region_id THEN 1.0
           WHEN g.is_online THEN 0.8
           ELSE 0.2 END * 0.30
      +
      -- Piece overlap (20%)
      COALESCE(
        (SELECT COUNT(*)::float / GREATEST(
          (SELECT COUNT(*) FROM gig_pieces WHERE gig_id = g.id), 1)
         FROM gig_pieces gp
         WHERE gp.gig_id = g.id AND gp.piece_id = ANY(ud.repertoire_pieces))
      , 0) * 0.20
      +
      -- Random factor for diversity (15%)
      random() * 0.15
    ) as total_score,
    COALESCE(
      (SELECT COUNT(*)::float / GREATEST(COUNT(*) OVER(), 1)
       FROM gig_instruments gi
       WHERE gi.gig_id = g.id AND gi.instrument_id = ANY(ud.instruments))
    , 0) as instrument_score,
    CASE WHEN g.region_id = ud.region_id THEN 1.0
         WHEN g.is_online THEN 0.8
         ELSE 0.2 END as location_score,
    COALESCE(
      (SELECT COUNT(*)::float / GREATEST(
        (SELECT COUNT(*) FROM gig_pieces WHERE gig_id = g.id), 1)
       FROM gig_pieces gp
       WHERE gp.gig_id = g.id AND gp.piece_id = ANY(ud.repertoire_pieces))
    , 0) as piece_score
  FROM gigs g, user_data ud
  WHERE g.status = 'active' AND g.user_id != p_user_id
  ORDER BY total_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
