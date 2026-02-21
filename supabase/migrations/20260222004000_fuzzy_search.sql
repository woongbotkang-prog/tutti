-- TUTTI — 검색 퍼지 매칭 마이그레이션
-- pg_trgm 확장 + composer_aliases 테이블 + fuzzy 검색 함수

-- 1) pg_trgm 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2) composer_aliases 테이블 생성
CREATE TABLE IF NOT EXISTS composer_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  composer_id UUID NOT NULL REFERENCES composers(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_composer_aliases_alias ON composer_aliases USING gin (alias gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_composer_aliases_composer ON composer_aliases(composer_id);

-- 3) 주요 작곡가 한글 변형 alias 등록
-- 모차르트 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['모짜르트', '모자르트', 'Mozart', 'mozart'])
FROM composers WHERE name_ko = '볼프강 아마데우스 모차르트'
ON CONFLICT DO NOTHING;

-- 베토벤 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['베토벤', '배토벤', '베에토벤', 'Beethoven', 'beethoven'])
FROM composers WHERE name_ko = '루드비히 판 베토벤'
ON CONFLICT DO NOTHING;

-- 바흐 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['바하', 'Bach', 'bach', 'J.S.Bach', 'JS Bach'])
FROM composers WHERE name_ko = '요한 세바스찬 바흐'
ON CONFLICT DO NOTHING;

-- 차이콥스키 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['차이코프스키', '차이코브스키', '차이콥스키', 'Tchaikovsky', 'tchaikovsky', 'Chaikovsky'])
FROM composers WHERE name_ko = '표트르 차이콥스키'
ON CONFLICT DO NOTHING;

-- 쇼팽 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['쇼팽', '쇼팡', '쇼빵', 'Chopin', 'chopin'])
FROM composers WHERE name_ko = '프레데리크 쇼팽'
ON CONFLICT DO NOTHING;

-- 드보르자크 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['드보르작', '드보르샥', '드보르쟉', 'Dvorak', 'dvorak', 'Dvořák'])
FROM composers WHERE name_ko = '안토닌 드보르자크'
ON CONFLICT DO NOTHING;

-- 브람스 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['브람즈', 'Brahms', 'brahms'])
FROM composers WHERE name_ko = '요하네스 브람스'
ON CONFLICT DO NOTHING;

-- 슈베르트 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['슈베르토', '슈벨트', 'Schubert', 'schubert'])
FROM composers WHERE name_ko = '프란츠 슈베르트'
ON CONFLICT DO NOTHING;

-- 멘델스존 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['멘델스죤', '멘델쏜', 'Mendelssohn', 'mendelssohn'])
FROM composers WHERE name_ko = '펠릭스 멘델스존'
ON CONFLICT DO NOTHING;

-- 슈만 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['슈우만', 'Schumann', 'schumann'])
FROM composers WHERE name_ko = '로베르트 슈만'
ON CONFLICT DO NOTHING;

-- 하이든 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['하이돈', '하이든', 'Haydn', 'haydn'])
FROM composers WHERE name_ko = '프란츠 요제프 하이든'
ON CONFLICT DO NOTHING;

-- 드뷔시 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['드뷔씨', '드비시', '드빗시', 'Debussy', 'debussy'])
FROM composers WHERE name_ko = '클로드 드뷔시'
ON CONFLICT DO NOTHING;

-- 라벨 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['라벨', '라블', 'Ravel', 'ravel'])
FROM composers WHERE name_ko = '모리스 라벨'
ON CONFLICT DO NOTHING;

-- 비발디 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['비발디', '비발듸', 'Vivaldi', 'vivaldi'])
FROM composers WHERE name_ko = '안토니오 비발디'
ON CONFLICT DO NOTHING;

-- 헨델 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['핸델', '헨들', 'Handel', 'handel', 'Händel'])
FROM composers WHERE name_ko = '게오르그 프리데릭 헨델'
ON CONFLICT DO NOTHING;

-- 라흐마니노프 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['라흐마니노프', '라흐마니놉', '라흐마닌오프', 'Rachmaninoff', 'Rachmaninov', 'rachmaninoff'])
FROM composers WHERE name_ko = '세르게이 라흐마니노프'
ON CONFLICT DO NOTHING;

-- 쇼스타코비치 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['쇼스타코비치', '쇼스타코비츠', 'Shostakovich', 'shostakovich'])
FROM composers WHERE name_ko = '드미트리 쇼스타코비치'
ON CONFLICT DO NOTHING;

-- 프로코피에프 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['프로코피예프', '프로코피엡', 'Prokofiev', 'prokofiev'])
FROM composers WHERE name_ko = '세르게이 프로코피에프'
ON CONFLICT DO NOTHING;

-- 시벨리우스 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['시벨리우스', '시벨리어스', 'Sibelius', 'sibelius'])
FROM composers WHERE name_ko = '장 시벨리우스'
ON CONFLICT DO NOTHING;

-- 그리그 변형
INSERT INTO composer_aliases (composer_id, alias)
SELECT id, unnest(ARRAY['그리이그', 'Grieg', 'grieg'])
FROM composers WHERE name_ko = '에드바르 그리그'
ON CONFLICT DO NOTHING;

-- 4) 검색 함수: alias를 포함한 작곡가 fuzzy 검색
CREATE OR REPLACE FUNCTION search_composers_fuzzy(search_text TEXT)
RETURNS TABLE(composer_id UUID, relevance FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  -- 정확한 이름 매칭
  SELECT c.id, 1.0::FLOAT
  FROM composers c
  WHERE c.name_ko ILIKE '%' || search_text || '%'
     OR c.name ILIKE '%' || search_text || '%'
     OR c.name_en ILIKE '%' || search_text || '%'

  UNION

  -- alias 매칭
  SELECT ca.composer_id, 0.9::FLOAT
  FROM composer_aliases ca
  WHERE ca.alias ILIKE '%' || search_text || '%'

  UNION

  -- pg_trgm 유사도 매칭 (이름)
  SELECT c.id, similarity(c.name_ko, search_text)::FLOAT
  FROM composers c
  WHERE similarity(c.name_ko, search_text) > 0.3

  UNION

  -- pg_trgm 유사도 매칭 (alias)
  SELECT ca.composer_id, similarity(ca.alias, search_text)::FLOAT
  FROM composer_aliases ca
  WHERE similarity(ca.alias, search_text) > 0.3

  ORDER BY relevance DESC;
END;
$$;

-- 5) composers 테이블에 trgm 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_composers_name_ko_trgm ON composers USING gin (name_ko gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_composers_name_trgm ON composers USING gin (name gin_trgm_ops);
