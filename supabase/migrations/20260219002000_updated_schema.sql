-- TUTTI Platform - Updated Schema Migration
-- Aligns DB schema with application code (TypeScript types & queries)
-- Created: 2026-02-19

-- ============================================================================
-- DROP OLD TABLES (if exist from previous migration)
-- ============================================================================

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS repertoires CASCADE;
DROP TABLE IF EXISTS organization_profiles CASCADE;
DROP TABLE IF EXISTS individual_profiles CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================================================
-- USER PROFILES (풍부한 필드로 재정의)
-- ============================================================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('individual', 'organization')),
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  phone VARCHAR(30),
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  manner_temperature NUMERIC(4,1) NOT NULL DEFAULT 36.5
    CHECK (manner_temperature >= 0 AND manner_temperature <= 100),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_region ON user_profiles(region_id);
CREATE INDEX idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- USER INSTRUMENTS (유저-악기 매핑)
-- ============================================================================

CREATE TABLE user_instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  instrument_id UUID NOT NULL REFERENCES instruments(id) ON DELETE RESTRICT,
  skill_level VARCHAR(20) NOT NULL
    CHECK (skill_level IN ('beginner', 'elementary', 'intermediate', 'advanced', 'professional')),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  years_of_experience SMALLINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, instrument_id)
);

CREATE INDEX idx_user_instruments_user ON user_instruments(user_id);
CREATE INDEX idx_user_instruments_instrument ON user_instruments(instrument_id);

-- ============================================================================
-- INDIVIDUAL PROFILES (개인 상세 정보)
-- ============================================================================

CREATE TABLE individual_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  real_name VARCHAR(100),
  birth_year SMALLINT,
  gender VARCHAR(10),
  education TEXT,
  career_summary TEXT,
  website_url VARCHAR(500),
  social_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_individual_profiles_user ON individual_profiles(user_id);

-- ============================================================================
-- ORGANIZATION PROFILES (단체 상세 정보)
-- ============================================================================

CREATE TABLE organization_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  org_name VARCHAR(255) NOT NULL,
  org_type VARCHAR(50),
  founded_year SMALLINT,
  member_count SMALLINT,
  website_url VARCHAR(500),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(30),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organization_profiles_user ON organization_profiles(user_id);

-- ============================================================================
-- USER REPERTOIRE (유저 레퍼토리)
-- ============================================================================

CREATE TABLE user_repertoire (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  composer_id UUID REFERENCES composers(id) ON DELETE SET NULL,
  composer_name VARCHAR(255) NOT NULL,
  piece_name VARCHAR(255) NOT NULL,
  genre_tag_id UUID,
  performance_ready BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_repertoire_user ON user_repertoire(user_id);

-- ============================================================================
-- GENRE TAGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS genre_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- GIGS (공고) - listings 대체
-- ============================================================================

CREATE TABLE gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  gig_type VARCHAR(10) NOT NULL CHECK (gig_type IN ('hiring', 'seeking')),
  status VARCHAR(10) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'closed', 'expired')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  required_skill_level VARCHAR(20)
    CHECK (required_skill_level IN ('beginner', 'elementary', 'intermediate', 'advanced', 'professional')),
  min_skill_level VARCHAR(20)
    CHECK (min_skill_level IN ('beginner', 'elementary', 'intermediate', 'advanced', 'professional')),
  max_applicants SMALLINT,
  current_applicants SMALLINT NOT NULL DEFAULT 0,
  event_date DATE,
  event_date_flexible BOOLEAN NOT NULL DEFAULT FALSE,
  rehearsal_info TEXT,
  compensation TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gigs_user ON gigs(user_id);
CREATE INDEX idx_gigs_status ON gigs(status);
CREATE INDEX idx_gigs_type ON gigs(gig_type);
CREATE INDEX idx_gigs_region ON gigs(region_id);
CREATE INDEX idx_gigs_created_at ON gigs(created_at DESC);

-- ============================================================================
-- GIG INSTRUMENTS (공고-악기 매핑)
-- ============================================================================

CREATE TABLE gig_instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  instrument_id UUID NOT NULL REFERENCES instruments(id) ON DELETE RESTRICT,
  count_needed SMALLINT NOT NULL DEFAULT 1,
  notes TEXT,
  UNIQUE(gig_id, instrument_id)
);

CREATE INDEX idx_gig_instruments_gig ON gig_instruments(gig_id);

-- ============================================================================
-- GIG GENRE TAGS (공고-장르 태그 매핑)
-- ============================================================================

CREATE TABLE gig_genre_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  genre_tag_id UUID NOT NULL REFERENCES genre_tags(id) ON DELETE CASCADE,
  UNIQUE(gig_id, genre_tag_id)
);

-- ============================================================================
-- APPLICATIONS (지원)
-- ============================================================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status VARCHAR(10) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  message TEXT,
  rejection_reason_code VARCHAR(50),
  rejection_reason_text TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(gig_id, applicant_id)
);

CREATE INDEX idx_applications_gig ON applications(gig_id);
CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ============================================================================
-- CHAT ROOMS
-- ============================================================================

CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  room_type VARCHAR(10) NOT NULL DEFAULT 'direct'
    CHECK (room_type IN ('direct', 'group')),
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_rooms_application ON chat_rooms(application_id);

-- ============================================================================
-- CHAT PARTICIPANTS
-- ============================================================================

CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_chat_participants_room ON chat_participants(room_id);
CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);

-- ============================================================================
-- CHAT MESSAGES
-- ============================================================================

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at ASC);

-- ============================================================================
-- REVIEWS
-- ============================================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  score SMALLINT NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  is_blind BOOLEAN NOT NULL DEFAULT TRUE,
  revealed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(application_id, reviewer_id)
);

-- ============================================================================
-- MANNER TEMPERATURE LOG
-- ============================================================================

CREATE TABLE manner_temperature_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  change_amount NUMERIC(4,1) NOT NULL,
  reason TEXT NOT NULL,
  related_review_id UUID REFERENCES reviews(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_manner_logs_user ON manner_temperature_logs(user_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'application_received', 'application_accepted', 'application_rejected',
    'new_message', 'gig_expiring', 'review_request', 'system'
  )),
  title VARCHAR(255) NOT NULL,
  body TEXT,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_repertoire ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- user_profiles: 본인만 조회/수정, INSERT는 인증된 사용자
CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT USING (TRUE); -- 공개 프로필

CREATE POLICY "user_profiles_insert" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update" ON user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- user_instruments: 본인 것만 관리
CREATE POLICY "user_instruments_select" ON user_instruments
  FOR SELECT USING (TRUE);

CREATE POLICY "user_instruments_insert" ON user_instruments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_instruments_update" ON user_instruments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_instruments_delete" ON user_instruments
  FOR DELETE USING (auth.uid() = user_id);

-- individual_profiles: 전체 공개 조회, 본인만 수정
CREATE POLICY "individual_profiles_select" ON individual_profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "individual_profiles_insert" ON individual_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "individual_profiles_update" ON individual_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- organization_profiles
CREATE POLICY "organization_profiles_select" ON organization_profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "organization_profiles_insert" ON organization_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "organization_profiles_update" ON organization_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- user_repertoire: 본인 것만
CREATE POLICY "user_repertoire_select" ON user_repertoire
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_repertoire_insert" ON user_repertoire
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_repertoire_delete" ON user_repertoire
  FOR DELETE USING (auth.uid() = user_id);

-- gigs: 활성 공고는 전체 공개, 본인 것만 관리
CREATE POLICY "gigs_select" ON gigs
  FOR SELECT USING (status IN ('active', 'closed') OR user_id = auth.uid());

CREATE POLICY "gigs_insert" ON gigs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gigs_update" ON gigs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "gigs_delete" ON gigs
  FOR DELETE USING (auth.uid() = user_id);

-- gig_instruments: 공고 소유자만 관리
CREATE POLICY "gig_instruments_select" ON gig_instruments
  FOR SELECT USING (TRUE);

CREATE POLICY "gig_instruments_insert" ON gig_instruments
  FOR INSERT WITH CHECK (
    gig_id IN (SELECT id FROM gigs WHERE user_id = auth.uid())
  );

CREATE POLICY "gig_instruments_delete" ON gig_instruments
  FOR DELETE USING (
    gig_id IN (SELECT id FROM gigs WHERE user_id = auth.uid())
  );

-- applications: 지원자 + 공고 작성자만 접근
CREATE POLICY "applications_select" ON applications
  FOR SELECT USING (
    applicant_id = auth.uid() OR
    gig_id IN (SELECT id FROM gigs WHERE user_id = auth.uid())
  );

CREATE POLICY "applications_insert" ON applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "applications_update" ON applications
  FOR UPDATE USING (
    applicant_id = auth.uid() OR
    gig_id IN (SELECT id FROM gigs WHERE user_id = auth.uid())
  );

-- chat_rooms: 참여자만 접근
CREATE POLICY "chat_rooms_select" ON chat_rooms
  FOR SELECT USING (
    id IN (SELECT room_id FROM chat_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "chat_rooms_insert" ON chat_rooms
  FOR INSERT WITH CHECK (TRUE); -- 서버 사이드 트리거로만 생성

-- chat_participants: 참여자만 접근
CREATE POLICY "chat_participants_select" ON chat_participants
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM chat_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "chat_participants_update" ON chat_participants
  FOR UPDATE USING (auth.uid() = user_id); -- last_read_at 업데이트

-- chat_messages: 채팅방 참여자만 접근
CREATE POLICY "chat_messages_select" ON chat_messages
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM chat_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    room_id IN (SELECT room_id FROM chat_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "chat_messages_update" ON chat_messages
  FOR UPDATE USING (auth.uid() = sender_id); -- 본인 메시지 삭제(소프트)

-- notifications: 본인 것만
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (auth.uid() = user_id); -- is_read 업데이트

-- ============================================================================
-- TRIGGER: user_profiles 자동 생성 (회원가입 시)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    user_type,
    display_name,
    manner_temperature
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'individual'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    36.5
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- TRIGGER: current_applicants 자동 카운트
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_gig_applicant_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gigs SET current_applicants = current_applicants + 1 WHERE id = NEW.gig_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gigs SET current_applicants = GREATEST(0, current_applicants - 1) WHERE id = OLD.gig_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_application_change ON applications;
CREATE TRIGGER on_application_change
  AFTER INSERT OR DELETE ON applications
  FOR EACH ROW EXECUTE PROCEDURE public.update_gig_applicant_count();

-- ============================================================================
-- TRIGGER: updated_at 자동 갱신
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

CREATE TRIGGER gigs_updated_at
  BEFORE UPDATE ON gigs
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

CREATE TRIGGER chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
