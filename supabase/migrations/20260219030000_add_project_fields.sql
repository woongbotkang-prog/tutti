-- gigs 테이블에 곡 기반 프로젝트 필드 추가
-- Phase 2: 기존 구인/구직 시스템 유지 + 곡 기반 프로젝트 모집 기능 추가

ALTER TABLE gigs
  ADD COLUMN IF NOT EXISTS is_project boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS piece_name text,
  ADD COLUMN IF NOT EXISTS composer_id uuid REFERENCES composers(id) ON DELETE SET NULL;

-- 프로젝트 탭 필터링 성능 개선 인덱스
CREATE INDEX IF NOT EXISTS idx_gigs_is_project ON gigs(is_project) WHERE is_project = true;

COMMENT ON COLUMN gigs.is_project IS '곡 기반 프로젝트 모집 여부';
COMMENT ON COLUMN gigs.piece_name IS '연주 예정 곡명 (프로젝트 모드일 때)';
COMMENT ON COLUMN gigs.composer_id IS '작곡가 ID (composers 테이블 참조)';
