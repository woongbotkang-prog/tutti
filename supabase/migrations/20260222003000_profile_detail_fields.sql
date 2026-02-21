-- 프로필 세분화 필드 추가
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS secondary_instrument TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS available_days TEXT[] DEFAULT '{}';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS experience_years INT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS one_liner TEXT;  -- 한 줄 소개 (50자)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;  -- 연주 영상 URL
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_ensemble_type TEXT;  -- orchestra/chamber/both
