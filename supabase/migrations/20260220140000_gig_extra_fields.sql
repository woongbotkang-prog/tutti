-- 공고 추가 필드: 예상 연습 횟수, 악보 제공 여부
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS rehearsal_frequency TEXT;
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS sheet_music_provided BOOLEAN DEFAULT false;
