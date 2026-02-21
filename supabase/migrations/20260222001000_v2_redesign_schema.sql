-- TUTTI v2 대개편 — DB 스키마 변경
-- 2026-02-22

-- 1) 단체명 컬럼 추가 (필수 필드, 기존 공고는 NULL 허용 후 삭제 예정)
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS ensemble_name TEXT;

-- 2) 카테고리 컬럼 추가 (orchestra | chamber, 자동 분류)
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS gig_category TEXT DEFAULT 'chamber';

-- 3) gig_type을 nullable로 변경 (deprecated)
ALTER TABLE gigs ALTER COLUMN gig_type DROP NOT NULL;
ALTER TABLE gigs ALTER COLUMN gig_type SET DEFAULT NULL;

-- 4) rehearsal_frequency 컬럼 추가 (기존에 없을 수 있음)
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS rehearsal_frequency TEXT;

-- 5) sheet_music_provided 컬럼 추가
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS sheet_music_provided BOOLEAN DEFAULT false;

-- 6) 기존 공고에 기본 ensemble_name 채우기
UPDATE gigs SET ensemble_name = title WHERE ensemble_name IS NULL;

-- 7) 기존 공고에 카테고리 자동 분류 적용
-- (gig_instruments 수 기반)
UPDATE gigs SET gig_category = 'orchestra'
WHERE id IN (
  SELECT gig_id FROM gig_instruments
  GROUP BY gig_id
  HAVING SUM(count_needed) >= 7
);
