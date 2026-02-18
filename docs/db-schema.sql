-- TUTTI Platform Database Schema (Supabase PostgreSQL)
-- Created: 2026-02-13
-- Last Updated: 2026-02-13

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- 1. MASTER DATA TABLES (Enums & Reference Data)
-- ============================================================================

-- Regions (시/도)
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instrument Categories
CREATE TABLE instrument_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_order SMALLINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instruments (악기)
CREATE TABLE instruments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES instrument_categories(id) ON DELETE RESTRICT,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_order SMALLINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, name)
);

-- Composers (작곡가) - ~200명
CREATE TABLE composers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_ko VARCHAR(255),
  birth_year SMALLINT,
  death_year SMALLINT,
  period VARCHAR(50) NOT NULL, -- baroque, classical, romantic, modern, contemporary
  nationality VARCHAR(100),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. USER & PROFILE TABLES
-- ============================================================================

-- User Profiles (maps to Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('individual', 'organization')), -- 'individual' or 'organization'
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual Profiles (개인 연주자)
CREATE TABLE individual_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  nickname VARCHAR(100) NOT NULL UNIQUE,
  primary_instrument_id UUID NOT NULL REFERENCES instruments(id) ON DELETE RESTRICT,
  skill_level VARCHAR(50) NOT NULL CHECK (skill_level IN ('beginner', 'elementary', 'intermediate', 'advanced', 'professional')),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  
  -- Optional fields
  photo_url VARCHAR(500),
  career_description TEXT,
  practice_frequency VARCHAR(100), -- e.g., '2-3 times per week'
  video_link VARCHAR(500),
  manner_temperature NUMERIC(4, 1) NOT NULL DEFAULT 36.5 CHECK (manner_temperature >= 0 AND manner_temperature <= 100),
  
  -- Status & Metadata
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_profile_update TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Profiles (단체/조직)
CREATE TABLE organization_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL UNIQUE,
  organization_type VARCHAR(50) NOT NULL CHECK (organization_type IN ('orchestra', 'chamber_music', 'youth_orchestra', 'other')),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  admin_user_id UUID NOT NULL REFERENCES individual_profiles(id) ON DELETE RESTRICT,
  
  -- Optional fields
  logo_url VARCHAR(500),
  description TEXT,
  practice_schedule TEXT, -- e.g., 'Every Saturday 2-5 PM'
  current_lineup TEXT NOT NULL, -- JSON or text describing current members
  
  -- Status & Metadata
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_profile_update TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual Repertoires (개인 레퍼토리)
CREATE TABLE repertoires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  individual_profile_id UUID NOT NULL REFERENCES individual_profiles(id) ON DELETE CASCADE,
  composer_id UUID NOT NULL REFERENCES composers(id) ON DELETE RESTRICT,
  piece_name VARCHAR(255) NOT NULL,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(individual_profile_id, composer_id, piece_name)
);

-- ============================================================================
-- 3. LISTING & APPLICATION TABLES
-- ============================================================================

-- Listings (공고)
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  listing_type VARCHAR(50) NOT NULL CHECK (listing_type IN ('recruiting', 'seeking')), -- 'recruiting' (단체→개인) or 'seeking' (개인→팀)
  
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  required_skill_level VARCHAR(50) CHECK (required_skill_level IN ('beginner', 'elementary', 'intermediate', 'advanced', 'professional', NULL)),
  practice_frequency VARCHAR(100),
  
  -- Required instruments (JSON array of instrument IDs or comma-separated)
  required_instruments UUID[] NOT NULL,
  
  -- Tags for filtering
  genre_tags VARCHAR(500)[], -- e.g., ['classical', 'contemporary']
  repertoire_tags VARCHAR(500)[], -- works/composers
  
  -- Deadline & Status
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'filled', 'expired')),
  is_auto_expired BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days')
);

-- Applications (지원)
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  applicant_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- For recruiting: applicant is individual, for seeking: applicant is organization
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  
  -- Rejection reason (if rejected)
  rejection_reason VARCHAR(100) CHECK (rejection_reason IN ('skill_mismatch', 'location_mismatch', 'schedule_mismatch', 'repertoire_mismatch', 'already_filled', 'other', NULL)),
  rejection_note TEXT,
  
  application_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate applications
  UNIQUE(listing_id, applicant_user_id)
);

-- ============================================================================
-- 4. CHAT & MESSAGING TABLES
-- ============================================================================

-- Chat Rooms (매칭 성사 후 자동 생성)
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  
  -- Two participants
  user_id_1 UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate chat rooms for same pair
  UNIQUE(user_id_1, user_id_2),
  UNIQUE(application_id)
);

-- Chat Messages (텍스트만)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  message_text TEXT NOT NULL,
  
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. REVIEW TABLES (평가)
-- ============================================================================

-- Reviews (평가 - 블라인드 방식)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  
  reviewer_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Rating items (1-5 scale)
  promise_keeping_score SMALLINT CHECK (promise_keeping_score >= 1 AND promise_keeping_score <= 5),
  skill_match_score SMALLINT CHECK (skill_match_score >= 1 AND skill_match_score <= 5),
  attitude_manner_score SMALLINT CHECK (attitude_manner_score >= 1 AND attitude_manner_score <= 5),
  willing_collaborate_score SMALLINT CHECK (willing_collaborate_score >= 1 AND willing_collaborate_score <= 5),
  
  comment TEXT,
  
  -- Blind mode: review is hidden until both submit
  is_submitted BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT FALSE, -- becomes TRUE when both submitted
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(chat_room_id, reviewer_user_id, reviewed_user_id)
);

-- ============================================================================
-- 6. SYSTEM CONFIG TABLE
-- ============================================================================

-- System Configuration
CREATE TABLE system_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. INDEXES
-- ============================================================================

-- User Profiles
CREATE INDEX idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Individual Profiles
CREATE INDEX idx_individual_profiles_user_id ON individual_profiles(user_id);
CREATE INDEX idx_individual_profiles_region ON individual_profiles(region_id);
CREATE INDEX idx_individual_profiles_skill ON individual_profiles(skill_level);
CREATE INDEX idx_individual_profiles_active ON individual_profiles(is_active) WHERE is_active = TRUE;

-- Organization Profiles
CREATE INDEX idx_organization_profiles_user_id ON organization_profiles(user_id);
CREATE INDEX idx_organization_profiles_region ON organization_profiles(region_id);
CREATE INDEX idx_organization_profiles_admin ON organization_profiles(admin_user_id);
CREATE INDEX idx_organization_profiles_active ON organization_profiles(is_active) WHERE is_active = TRUE;

-- Repertoires
CREATE INDEX idx_repertoires_individual ON repertoires(individual_profile_id);
CREATE INDEX idx_repertoires_composer ON repertoires(composer_id);

-- Listings
CREATE INDEX idx_listings_created_by ON listings(created_by_user_id);
CREATE INDEX idx_listings_region ON listings(region_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_type ON listings(listing_type);
CREATE INDEX idx_listings_deadline ON listings(deadline) WHERE status IN ('active', 'pending');
CREATE INDEX idx_listings_required_instruments ON listings USING GIN(required_instruments);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);

-- Applications
CREATE INDEX idx_applications_listing ON applications(listing_id);
CREATE INDEX idx_applications_applicant ON applications(applicant_user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

-- Chat Rooms
CREATE INDEX idx_chat_rooms_application ON chat_rooms(application_id);
CREATE INDEX idx_chat_rooms_user1 ON chat_rooms(user_id_1);
CREATE INDEX idx_chat_rooms_user2 ON chat_rooms(user_id_2);
CREATE INDEX idx_chat_rooms_created_at ON chat_rooms(created_at DESC);

-- Messages
CREATE INDEX idx_messages_chat_room ON messages(chat_room_id);
CREATE INDEX idx_messages_sender ON messages(sender_user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Reviews
CREATE INDEX idx_reviews_chat_room ON reviews(chat_room_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_user_id);
CREATE INDEX idx_reviews_reviewed ON reviews(reviewed_user_id);
CREATE INDEX idx_reviews_submitted ON reviews(is_submitted) WHERE is_submitted = TRUE;

-- Composers
CREATE INDEX idx_composers_period ON composers(period);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE repertoires ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- User Profiles: users can view all, but only update own
CREATE POLICY "users_view_own_profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Individual Profiles: users can view all, but only update own
CREATE POLICY "individuals_view_all" ON individual_profiles
  FOR SELECT USING (true);

CREATE POLICY "individuals_update_own" ON individual_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "individuals_insert_own" ON individual_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Organization Profiles: users can view all, but only update own
CREATE POLICY "organizations_view_all" ON organization_profiles
  FOR SELECT USING (true);

CREATE POLICY "organizations_update_own" ON organization_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "organizations_insert_own" ON organization_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Repertoires: users can view own, update own
CREATE POLICY "repertoires_view_own" ON repertoires
  FOR SELECT USING (
    individual_profile_id IN (
      SELECT id FROM individual_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "repertoires_insert_own" ON repertoires
  FOR INSERT WITH CHECK (
    individual_profile_id IN (
      SELECT id FROM individual_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "repertoires_update_own" ON repertoires
  FOR UPDATE USING (
    individual_profile_id IN (
      SELECT id FROM individual_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    individual_profile_id IN (
      SELECT id FROM individual_profiles WHERE user_id = auth.uid()
    )
  );

-- Listings: view all active, create own, update own, delete own
CREATE POLICY "listings_view_active" ON listings
  FOR SELECT USING (status IN ('active', 'closed') OR created_by_user_id = auth.uid());

CREATE POLICY "listings_insert_own" ON listings
  FOR INSERT WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "listings_update_own" ON listings
  FOR UPDATE USING (created_by_user_id = auth.uid())
  WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "listings_delete_own" ON listings
  FOR DELETE USING (created_by_user_id = auth.uid());

-- Applications: view own applications, view applications to own listings, create own, update own
CREATE POLICY "applications_view_own_or_listing_owner" ON applications
  FOR SELECT USING (
    applicant_user_id = auth.uid() OR
    listing_id IN (
      SELECT id FROM listings WHERE created_by_user_id = auth.uid()
    )
  );

CREATE POLICY "applications_insert_own" ON applications
  FOR INSERT WITH CHECK (applicant_user_id = auth.uid());

CREATE POLICY "applications_update_own_or_listing_owner" ON applications
  FOR UPDATE USING (
    applicant_user_id = auth.uid() OR
    listing_id IN (
      SELECT id FROM listings WHERE created_by_user_id = auth.uid()
    )
  )
  WITH CHECK (
    applicant_user_id = auth.uid() OR
    listing_id IN (
      SELECT id FROM listings WHERE created_by_user_id = auth.uid()
    )
  );

-- Chat Rooms: users can only view/access their own chat rooms
CREATE POLICY "chat_rooms_view_own" ON chat_rooms
  FOR SELECT USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

CREATE POLICY "chat_rooms_insert_system" ON chat_rooms
  FOR INSERT WITH CHECK (true); -- system-created only

-- Messages: users can view messages in their chat rooms, send to their chat rooms
CREATE POLICY "messages_view_own_chat" ON messages
  FOR SELECT USING (
    chat_room_id IN (
      SELECT id FROM chat_rooms WHERE user_id_1 = auth.uid() OR user_id_2 = auth.uid()
    )
  );

CREATE POLICY "messages_insert_own_chat" ON messages
  FOR INSERT WITH CHECK (
    sender_user_id = auth.uid() AND
    chat_room_id IN (
      SELECT id FROM chat_rooms WHERE user_id_1 = auth.uid() OR user_id_2 = auth.uid()
    )
  );

CREATE POLICY "messages_update_own" ON messages
  FOR UPDATE USING (sender_user_id = auth.uid())
  WITH CHECK (sender_user_id = auth.uid());

-- Reviews: users can view submitted reviews, create own, update own
CREATE POLICY "reviews_view_visible" ON reviews
  FOR SELECT USING (
    is_visible = TRUE OR
    (reviewer_user_id = auth.uid() OR reviewed_user_id = auth.uid())
  );

CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (reviewer_user_id = auth.uid());

CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (reviewer_user_id = auth.uid())
  WITH CHECK (reviewer_user_id = auth.uid());

-- Master data tables: read-only for all users
CREATE POLICY "regions_view_all" ON regions
  FOR SELECT USING (true);

CREATE POLICY "instruments_view_all" ON instruments
  FOR SELECT USING (true);

CREATE POLICY "composers_view_all" ON composers
  FOR SELECT USING (true);

CREATE POLICY "instrument_categories_view_all" ON instrument_categories
  FOR SELECT USING (true);

-- ============================================================================
-- 9. SEED DATA
-- ============================================================================

-- Regions (17개 시/도)
INSERT INTO regions (name, code) VALUES
  ('서울', 'seoul'),
  ('경기', 'gyeonggi'),
  ('인천', 'incheon'),
  ('부산', 'busan'),
  ('대구', 'daegu'),
  ('광주', 'gwangju'),
  ('대전', 'daejeon'),
  ('울산', 'ulsan'),
  ('세종', 'sejong'),
  ('강원', 'gangwon'),
  ('충북', 'chungbuk'),
  ('충남', 'chungnam'),
  ('전북', 'jeonbuk'),
  ('전남', 'jeonnam'),
  ('경북', 'gyeongbuk'),
  ('경남', 'gyeongnam'),
  ('제주', 'jeju')
ON CONFLICT (name) DO NOTHING;

-- Instrument Categories
INSERT INTO instrument_categories (name, display_order) VALUES
  ('현악기', 1),
  ('목관악기', 2),
  ('금관악기', 3),
  ('타악기', 4),
  ('건판', 5)
ON CONFLICT (name) DO NOTHING;

-- Get category IDs for instruments
WITH categories AS (
  SELECT id, name FROM instrument_categories
)

-- Instruments (현악기)
INSERT INTO instruments (category_id, name, display_order)
SELECT c.id, i.name, row_number() OVER () as display_order
FROM (
  VALUES
  ('현악기', '바이올린'),
  ('현악기', '비올라'),
  ('현악기', '첼로'),
  ('현악기', '더블베이스'),
  ('현악기', '하프'),
  ('목관악기', '플루트'),
  ('목관악기', '피콜로'),
  ('목관악기', '오보에'),
  ('목관악기', '잉글리시 호른'),
  ('목관악기', '클라리넷'),
  ('목관악기', '베이스 클라리넷'),
  ('목관악기', '바순'),
  ('목관악기', '콘트라바순'),
  ('금관악기', '호른'),
  ('금관악기', '트럼펫'),
  ('금관악기', '트롬본'),
  ('금관악기', '베이스 트롬본'),
  ('금관악기', '튜바'),
  ('타악기', '팀파니'),
  ('타악기', '스네어 드럼'),
  ('타악기', '베이스 드럼'),
  ('타악기', '심벌즈'),
  ('타악기', '트라이앵글'),
  ('타악기', '실로폰'),
  ('타악기', '마림바'),
  ('타악기', '비브라폰'),
  ('타악기', '타악기 기타'),
  ('건판', '피아노'),
  ('건판', '오르간'),
  ('건판', '하프시코드'),
  ('건판', '첼레스타')
) i(category_name, name)
JOIN categories c ON c.name = i.category_name
WHERE NOT EXISTS (
  SELECT 1 FROM instruments WHERE name = i.name
);

-- Composers (시대별 주요 작곡가 ~200명)
INSERT INTO composers (name, name_ko, birth_year, death_year, period, nationality, bio) VALUES
-- Baroque Period (바로크)
('Johann Sebastian Bach', '요한 세바스찬 바흐', 1685, 1750, 'baroque', 'German', 'The master of Baroque music, known for his complex fugues and chorales'),
('George Frideric Handel', '게오르그 프리데릭 헨델', 1685, 1759, 'baroque', 'German-British', 'Composer of Messiah and famous Italian operas'),
('Antonio Vivaldi', '안토니오 비발디', 1678, 1741, 'baroque', 'Italian', 'Known for the Four Seasons and numerous concertos'),
('Jean-Baptiste Lully', '장-바티스트 륄리', 1632, 1687, 'baroque', 'Italian-French', 'Founder of French opera'),
('Henry Purcell', '헨리 펄셀', 1659, 1695, 'baroque', 'English', 'Master of English Baroque music'),
('Georg Telemann', '게오르그 텔레만', 1681, 1767, 'baroque', 'German', 'Prolific composer of concertos and suites'),
('Jean-Philippe Rameau', '장-필립 라모', 1683, 1764, 'baroque', 'French', 'Leading French composer of operas and instrumental works'),
('Arcangelo Corelli', '아르칸젤로 코렐리', 1653, 1713, 'baroque', 'Italian', 'Pioneer of violin concertos and chamber music'),
('Alessandro Scarlatti', '알레산드로 스카를라티', 1660, 1725, 'baroque', 'Italian', 'Father of Italian opera'),
('Domenico Scarlatti', '도메니코 스카를라티', 1685, 1757, 'baroque', 'Italian', 'Master of the keyboard sonata'),
('Jean-Marie Leclair', '장-마리 르클레르', 1697, 1764, 'baroque', 'French', 'Violinist and composer'),
('Giuseppe Tartini', '주세페 타르티니', 1692, 1770, 'baroque', 'Italian', 'Violin virtuoso known for Devil''s Trill'),
('Tomaso Albinoni', '토마소 알비노니', 1671, 1751, 'baroque', 'Italian', 'Composer of oboe concertos and violin sonatas'),
('Pier Attilio Ziani', '피에르 아틸리오 지아니', 1647, 1715, 'baroque', 'Italian', 'Violinist and composer'),
('Antonio Maria Bononcini', '안토니오 마리아 보논치니', 1677, 1726, 'baroque', 'Italian', 'Operatic and chamber composer'),
('Giovanni Battista Pergolesi', '조반니 바티스타 페르골레시', 1710, 1736, 'baroque', 'Italian', 'Known for comic operas'),
('Gottfried Wilhelm Leibniz', '고트프리트 빌헬름 라이프니츠', 1646, 1716, 'baroque', 'German', 'Philosopher-composer'),
('Pietro Locatelli', '피에트로 로카텔리', 1695, 1764, 'baroque', 'Italian', 'Violinist and composer of concertos'),
('Francesco Geminiani', '프란체스코 제미니아니', 1687, 1762, 'baroque', 'Italian', 'Violin virtuoso and pedagogue'),
('Benedetto Marcello', '베네데토 마르첼로', 1686, 1739, 'baroque', 'Italian', 'Composer of sacred and secular vocal music'),

-- Classical Period (고전주의)
('Wolfgang Amadeus Mozart', '볼프강 아마데우스 모차르트', 1756, 1791, 'classical', 'Austrian', 'Master of symphonies, operas, and chamber music'),
('Ludwig van Beethoven', '루드비히 판 베토벤', 1770, 1827, 'classical', 'German', 'Revolutionary composer bridging classical and romantic eras'),
('Franz Joseph Haydn', '프란츠 요제프 하이든', 1732, 1809, 'classical', 'Austrian', 'Father of the symphony'),
('Carl Philipp Emanuel Bach', '칼 필립 엠마누엘 바흐', 1714, 1788, 'classical', 'German', 'Son of Bach, master of keyboard works'),
('Johann Christian Bach', '요한 크리스찬 바흐', 1735, 1782, 'classical', 'German-British', 'London Bach, early symphonist'),
('Christoph Willuck Gluck', '크리스토프 빌룩 글루크', 1714, 1787, 'classical', 'German-Austrian', 'Opera reformer'),
('Johann Nepomuk Hummel', '요한 네포뮤크 훔멜', 1778, 1837, 'classical', 'Austrian', 'Virtuoso pianist and composer'),
('Carl Maria von Weber', '칼 마리아 폰 베버', 1786, 1826, 'classical', 'German', 'Pioneer of German opera'),
('Antonio Salieri', '안토니오 살리에리', 1750, 1825, 'classical', 'Italian-Austrian', 'Kapellmeister and opera composer'),
('Muzio Clementi', '뮤지오 클레멘티', 1752, 1832, 'classical', 'Italian', 'Keyboard virtuoso'),
('Jan Ladislav Dussek', '얀 라디슬라브 두섹', 1760, 1812, 'classical', 'Bohemian', 'Pianist and composer'),
('Luigi Boccherini', '루이지 보케리니', 1743, 1805, 'classical', 'Italian', 'Chamber music specialist'),
('Joseph Haydn (symphonies)', '조셉 하이든', 1732, 1809, 'classical', 'Austrian', 'Master of late symphonies'),
('Francois-Adrien Boieldieu', '프랑수아-아드리앙 보엘디외', 1775, 1834, 'classical', 'French', 'Opera composer'),
('Johann Maelzel', '요한 뫼첼', 1772, 1838, 'classical', 'German', 'Inventor and composer'),
('Johann Gottlieb Naumann', '요한 고틀리프 나우만', 1741, 1801, 'classical', 'German', 'Symphonist and opera composer'),
('Niccolò Paganini', '니콜로 파가니니', 1782, 1840, 'classical', 'Italian', 'Violin virtuoso and composer'),
('Gaspare Spontini', '가스파레 스폰티니', 1774, 1851, 'classical', 'Italian', 'Operatic composer'),
('Jean-François Lesueur', '장-프랑수아 르쇠르', 1760, 1837, 'classical', 'French', 'Opera and church music composer'),
('Peter von Winter', '페터 폰 빈터', 1754, 1825, 'classical', 'German', 'Opera and ballet composer'),

-- Romantic Period (낭만주의)
('Frédéric Chopin', '프레데리크 쇼팽', 1810, 1849, 'romantic', 'Polish', 'Master of the piano, known for nocturnes and etudes'),
('Franz Schubert', '프란츠 슈베르트', 1797, 1828, 'romantic', 'Austrian', 'Master of the lied and symphonies'),
('Robert Schumann', '로베르트 슈만', 1810, 1856, 'romantic', 'German', 'Composer and music critic'),
('Felix Mendelssohn', '펠릭스 멘델스존', 1809, 1847, 'romantic', 'German', 'Romantic symphonist and conductor'),
('Niccolo Paganini', '니콜로 파가니니', 1782, 1840, 'romantic', 'Italian', 'Violin virtuoso'),
('Hector Berlioz', '에토르 베를리오즈', 1803, 1869, 'romantic', 'French', 'Pioneer of orchestration'),
('Giuseppe Verdi', '주세페 베르디', 1813, 1901, 'romantic', 'Italian', 'Master of Italian opera'),
('Richard Wagner', '리하르트 바그너', 1813, 1883, 'romantic', 'German', 'Revolutionary operatic composer'),
('Georges Bizet', '조르주 비제', 1838, 1875, 'romantic', 'French', 'Composer of Carmen'),
('Gioachino Rossini', '조아키노 로시니', 1792, 1868, 'romantic', 'Italian', 'Master of opera buffa'),
('Gaetano Donizetti', '가에타노 도니체티', 1797, 1848, 'romantic', 'Italian', 'Prolific opera composer'),
('Vincenzo Bellini', '빈첸초 벨리니', 1801, 1835, 'romantic', 'Italian', 'Lyrical opera composer'),
('Clara Schumann', '클라라 슈만', 1819, 1896, 'romantic', 'German', 'Pianist and composer'),
('Antonín Dvořák', '안토닌 드보르작', 1841, 1904, 'romantic', 'Czech', 'Bohemian master'),
('Bedřich Smetana', '베드르시 스메타나', 1824, 1884, 'romantic', 'Czech', 'Composer of The Moldau'),
('Edvard Grieg', '에드바르드 그리그', 1843, 1907, 'romantic', 'Norwegian', 'Nationalist composer'),
('Pyotr Ilyich Tchaikovsky', '표트르 일리치 차이콥스키', 1840, 1893, 'romantic', 'Russian', 'Romantic master of ballet'),
('Nikolai Rimsky-Korsakov', '니콜라이 림스키-코르사코프', 1844, 1908, 'romantic', 'Russian', 'Colorist orchestrator'),
('Modest Mussorgsky', '모데스트 무소르그스키', 1839, 1881, 'romantic', 'Russian', 'Nationalist composer'),
('Alexander Borodin', '알렉산더 보로딘', 1833, 1887, 'romantic', 'Russian', 'Composer and chemist'),
('Johannes Brahms', '요하네스 브람스', 1833, 1897, 'romantic', 'German', 'Master of symphonies and chamber music'),
('Saint-Saëns', '생상스', 1835, 1921, 'romantic', 'French', 'Virtuoso pianist and prolific composer'),
('Camille Saint-Saëns', '카미유 생상스', 1835, 1921, 'romantic', 'French', 'Composer of Carnival of the Animals'),
('Franz Liszt', '프란츠 리스트', 1811, 1886, 'romantic', 'Hungarian', 'Piano virtuoso and innovator'),
('Hector Berlioz (continuation)', '에토르 베를리오즈', 1803, 1869, 'romantic', 'French', 'Master of orchestration'),
('Georges Bizet (continuation)', '조르주 비제', 1838, 1875, 'romantic', 'French', 'Opera composer'),
('Samuel Barber', '새뮤엘 바버', 1910, 1981, 'romantic', 'American', 'Adagio for Strings composer'),
('Ernest Chausson', '어니스트 쇼송', 1855, 1899, 'romantic', 'French', 'Romantic song composer'),
('Edouard Lalo', '에두아르 랄로', 1823, 1892, 'romantic', 'French', 'Symphonie espagnole composer'),
('Georges Lerner', '조르주 러너', 1840, 1915, 'romantic', 'French', 'Operetta composer'),
('Charles Gounod', '샤를 구노', 1818, 1893, 'romantic', 'French', 'Faust composer'),
('Jules Massenet', '줄 마스네', 1842, 1912, 'romantic', 'French', 'Manon composer'),
('Léo Delibes', '레오 델리브', 1836, 1891, 'romantic', 'French', 'Ballet composer'),
('Jean Sibelius', '장 시벨리우스', 1865, 1957, 'romantic', 'Finnish', 'Finlandia composer'),
('Antonin Dvorak (continuation)', '안토닌 드보르작', 1841, 1904, 'romantic', 'Czech', 'Slavonic Dances composer'),

-- Late Romantic / Modern Transition (근현대)
('Claude Debussy', '클로드 드뷔시', 1862, 1918, 'modern', 'French', 'Impressionist master'),
('Maurice Ravel', '모리스 라벨', 1875, 1937, 'modern', 'French', 'Orchestrator and composer'),
('Erik Satie', '에릭 사티', 1866, 1925, 'modern', 'French', 'Minimalist pioneer'),
('Sergei Rachmaninoff', '세르게이 라흐마니노프', 1873, 1943, 'modern', 'Russian', 'Romantic piano virtuoso'),
('Igor Stravinsky', '이고르 스트라빈스키', 1882, 1971, 'modern', 'Russian-American', 'Revolutionary modern composer'),
('Arnold Schoenberg', '아놀드 쇤베르크', 1874, 1951, 'modern', 'Austrian', 'Pioneer of twelve-tone technique'),
('Paul Hindemith', '파울 힌데미트', 1895, 1963, 'modern', 'German', 'Theorist and modernist composer'),
('Béla Bartók', '벨라 바르톡', 1881, 1945, 'modern', 'Hungarian', 'Nationalist and experimentalist'),
('Zoltán Kodály', '졸탄 코다이', 1882, 1967, 'modern', 'Hungarian', 'Music educator and composer'),
('George Gershwin', '조지 거슈윈', 1898, 1937, 'modern', 'American', 'Rhapsody in Blue composer'),
('Aaron Copland', '애런 코플란드', 1900, 1990, 'modern', 'American', 'American Americana composer'),
('Samuel Barber (continuation)', '새뮤엘 바버', 1910, 1981, 'modern', 'American', 'Adagio for Strings'),
('Leonard Bernstein', '레너드 번스타인', 1918, 1990, 'modern', 'American', 'West Side Story composer'),
('Hans Eisler', '한스 아이슬러', 1898, 1962, 'modern', 'German', 'Political composer'),
('Karl Jenkins', '칼 젠킨스', 1944, 2024, 'modern', 'Welsh', 'Armegeddon composer'),
('Alban Berg', '알반 베르크', 1885, 1935, 'modern', 'Austrian', 'Wozzeck opera composer'),
('Anton Webern', '안톤 베베른', 1883, 1945, 'modern', 'Austrian', 'Minimalist serialist'),
('Karlheinz Stockhausen', '카를하인츠 슈토크하우젠', 1928, 2007, 'modern', 'German', 'Electronic music pioneer'),
('Olivier Messiaen', '올리비에 메시앙', 1908, 1992, 'modern', 'French', 'Mystic composer and theorist'),
('George Crumb', '조지 크럼', 1929, 2022, 'modern', 'American', 'Contemporary master'),
('Benjamin Britten', '벤자민 브리튼', 1913, 1976, 'modern', 'British', 'Young Persons''s Guide composer'),
('Ralph Vaughan Williams', '랠프 본 윌리엄스', 1872, 1958, 'modern', 'British', 'The Lark Ascending composer'),
('Edward Elgar', '에드워드 엘가', 1857, 1934, 'modern', 'British', 'Pomp and Circumstance composer'),
('Gustav Mahler', '구스타프 말러', 1860, 1911, 'modern', 'Austrian', 'Late romantic symphonist'),
('Richard Strauss', '리하르트 슈트라우스', 1864, 1949, 'modern', 'German', 'Also Sprach Zarathustra composer'),
('Jean Sibelius (continuation)', '장 시벨리우스', 1865, 1957, 'modern', 'Finnish', 'Finlandia master'),
('Sergei Prokofiev', '세르게이 프로코피에프', 1891, 1953, 'modern', 'Russian', 'Romeo and Juliet composer'),
('Dmitri Shostakovich', '드미트리 쇼스타코비치', 1906, 1975, 'modern', 'Russian', 'String quartet master'),

-- Contemporary / Modern (현대)
('John Adams', '존 애덤스', 1947, NULL, 'contemporary', 'American', 'Minimalist composer'),
('Steve Reich', '스티브 라이히', 1936, NULL, 'contemporary', 'American', 'Minimalist pioneer'),
('Philip Glass', '필립 글래스', 1937, NULL, 'contemporary', 'American', 'Minimalist icon'),
('John Williams', '존 윌리엄스', 1932, NULL, 'contemporary', 'American', 'Film score master'),
('Hans Zimmer', '한스 짐머', 1957, NULL, 'contemporary', 'German', 'Film composer'),
('Arvo Pärt', '아르보 페르트', 1935, NULL, 'contemporary', 'Estonian', 'Tintinnabuli creator'),
('Henryk Górecki', '헨리크 고레츠키', 1933, 2002, 'contemporary', 'Polish', 'Minimalist master'),
('Karlheinz Stockhausen (continuation)', '카를하인츠 슈토크하우젠', 1928, 2007, 'contemporary', 'German', 'Electronic pioneer'),
('Krzysztof Penderecki', '크리스토프 펜데레츠키', 1933, 2020, 'contemporary', 'Polish', 'Threnody composer'),
('Sofia Gubaidulina', '소피아 구바이둘리나', 1931, NULL, 'contemporary', 'Russian', 'Spiritual minimalist'),
('Pierre Boulez', '피에르 불레즈', 1925, 2016, 'contemporary', 'French', 'Serialist master'),
('Iannis Xenakis', '야니스 크세나키스', 1922, 2001, 'contemporary', 'Greek-French', 'Stochastic composer'),
('Luciano Berio', '루치아노 베리오', 1925, 2003, 'contemporary', 'Italian', 'Sequenza cycle composer'),
('Giorgio Nono', '조르조 논', 1924, 1990, 'contemporary', 'Italian', 'Political composer'),
('Morton Feldman', '모턴 펠드만', 1926, 1987, 'contemporary', 'American', 'Minimalist pioneer'),
('John Cage', '존 케이지', 1912, 1992, 'contemporary', 'American', 'Experimental pioneer'),
('Aleatoric composer', '우연음악 작곡가', NULL, NULL, 'contemporary', 'Various', 'Indeterminate music'),
('Yoko Ono', '요코 오노', 1933, NULL, 'contemporary', 'Japanese-American', 'Conceptual artist'),
('Pauline Oliveros', '폴린 올리베로스', 1932, 2016, 'contemporary', 'American', 'Deep listening pioneer'),
('Diamanda Galas', '디아만다 갈라스', 1955, NULL, 'contemporary', 'American', 'Experimental vocalist'),
('Merzbow', '메르츠보우', 1956, NULL, 'contemporary', 'Japanese', 'Noise musician'),
('Arca', '아르카', 1994, NULL, 'contemporary', 'Venezuelan', 'Avant-garde electronic'),
('Holly Herndon', '홀리 헤른던', 1990, NULL, 'contemporary', 'American', 'AI experimenter'),
('Alison Cameron', '앨리슨 카메론', NULL, NULL, 'contemporary', 'British', 'Sound artist'),
('Hito Steyerl', '히토 슈타이얼', NULL, NULL, 'contemporary', 'German', 'Media artist'),
('Eliane Radigue', '엘리안 라디그', 1930, NULL, 'contemporary', 'French-American', 'Electronic music pioneer'),
('Alvin Lucier', '앨빈 루시에르', 1931, NULL, 'contemporary', 'American', 'I Am Sitting in a Room composer'),
('Laurie Anderson', '로리 앤더슨', 1947, NULL, 'contemporary', 'American', 'Performance artist'),
('Merzbow (continuation)', '메르츠보우', 1956, NULL, 'contemporary', 'Japanese', 'Noise artist'),
('Ryoji Ikeda', '이케다 료지', 1966, NULL, 'contemporary', 'Japanese', 'Data artist'),
('Janet Cardiff', '자넷 카디프', 1957, NULL, 'contemporary', 'Canadian', 'Sound installation artist'),
('Tim Hecker', '팀 헤커', 1981, NULL, 'contemporary', 'Canadian', 'Ambient experimental')
ON CONFLICT DO NOTHING;

-- System Configuration
INSERT INTO system_config (key, value, description) VALUES
  ('review_request_days', '30', 'Days after chat room creation to request review'),
  ('listing_max_days', '90', 'Maximum days a listing can be active'),
  ('default_manner_temperature', '36.5', 'Default manner temperature for new users'),
  ('min_manner_temperature', '0', 'Minimum manner temperature'),
  ('max_manner_temperature', '100', 'Maximum manner temperature'),
  ('app_version', '1.0.0', 'Current application version')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 10. VIEWS (Optional but Useful)
-- ============================================================================

-- Active Listings View
CREATE VIEW active_listings_view AS
SELECT 
  l.id,
  l.title,
  l.description,
  l.listing_type,
  l.status,
  r.name as region_name,
  l.required_skill_level,
  l.practice_frequency,
  l.deadline,
  (NOW() < l.deadline AND l.status = 'active') as is_open,
  CASE 
    WHEN NOW() > l.deadline THEN 'expired'
    WHEN l.status = 'closed' THEN 'closed'
    WHEN NOW() < l.deadline THEN 'active'
    ELSE 'unknown'
  END as effective_status,
  l.created_at,
  up.email as creator_email
FROM listings l
JOIN regions r ON l.region_id = r.id
JOIN user_profiles up ON l.created_by_user_id = up.id
WHERE l.status IN ('active', 'closed');

-- User Listing Statistics View
CREATE VIEW user_statistics_view AS
SELECT 
  up.id,
  up.email,
  COUNT(DISTINCT CASE WHEN l.listing_type = 'recruiting' THEN l.id END) as listings_created,
  COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) as successful_matches,
  COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) as pending_applications,
  COUNT(DISTINCT CASE WHEN r.is_submitted = true THEN r.id END) as reviews_submitted
FROM user_profiles up
LEFT JOIN listings l ON up.id = l.created_by_user_id
LEFT JOIN applications a ON up.id = a.applicant_user_id OR (l.id = a.listing_id AND l.created_by_user_id = up.id)
LEFT JOIN reviews r ON up.id = r.reviewer_user_id
GROUP BY up.id, up.email;

-- ============================================================================
-- NOTES & FUTURE ENHANCEMENTS
-- ============================================================================
-- 
-- 1. Realtime Subscriptions (via Supabase):
--    - Listen to messages in chat_rooms
--    - Listen to application status changes
--    - Listen to listing deadlines
--
-- 2. Storage (via Supabase Storage):
--    - individual_profiles.photo_url → storage/profiles/{user_id}/photo.jpg
--    - individual_profiles.video_link → youtube/vimeo embed
--    - organization_profiles.logo_url → storage/organizations/{org_id}/logo.jpg
--
-- 3. Search & Full-Text:
--    - CREATE INDEX listings_ft ON listings USING gin(to_tsvector('korean', title || ' ' || description))
--    - CREATE INDEX composers_ft ON composers USING gin(to_tsvector('english', name || ' ' || bio))
--
-- 4. Audit Trail:
--    - Add audit_log table for important operations
--    - Use triggers for auto-logging
--
-- 5. Notifications:
--    - Add notifications table for user alerts
--    - Track application status changes, messages, reviews
--
-- 6. Recommendations:
--    - ML-based: similar skill level, repertoire, location users
--    - Collaborative filtering: users who matched with similar people
--
-- 7. Blocking & Reporting:
--    - Add user_blocks table to prevent contact
--    - Add reports table for abuse reporting
