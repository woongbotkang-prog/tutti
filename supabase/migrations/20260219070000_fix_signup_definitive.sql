-- ================================================================
-- DEFINITIVE FIX: 회원가입 'Database error saving new user' 해결
-- Date: 2026-02-19
--
-- 이 마이그레이션은 모든 가능한 원인을 한 번에 수정합니다:
-- 1. 기존 트리거/함수 완전 삭제 후 재생성
-- 2. user_profiles 테이블에 email 컬럼이 없는 것에 맞춤
-- 3. SECURITY DEFINER + SET search_path 명시
-- 4. 고아 auth.users 레코드 정리
-- 5. RLS INSERT 정책 정리
-- ================================================================

-- ================================================================
-- STEP 1: 기존 트리거/함수 완전 제거
-- ================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ================================================================
-- STEP 2: 고아 auth.users 레코드 정리 (user_profiles 없는 auth 레코드)
-- 이 레코드들이 있으면 같은 이메일로 재가입이 불가능
-- ================================================================
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
  AND id IN (
    SELECT au.id FROM auth.users au
    LEFT JOIN public.user_profiles up ON au.id = up.id
    WHERE up.id IS NULL
  );

-- ================================================================
-- STEP 3: 새 트리거 함수 (확실한 버전)
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_type TEXT;
  v_display_name TEXT;
BEGIN
  -- user_type 추출 및 검증
  v_user_type := COALESCE(
    NEW.raw_user_meta_data->>'user_type',
    'individual'
  );

  IF v_user_type NOT IN ('individual', 'organization') THEN
    v_user_type := 'individual';
  END IF;

  -- display_name 추출 (빈 문자열이면 이메일 앞부분 사용)
  v_display_name := COALESCE(
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'display_name', '')), ''),
    SPLIT_PART(COALESCE(NEW.email, 'user@example.com'), '@', 1)
  );

  -- 100자 제한 (VARCHAR(100) 컬럼)
  IF LENGTH(v_display_name) > 100 THEN
    v_display_name := LEFT(v_display_name, 100);
  END IF;

  -- user_profiles에 INSERT (email 컬럼 없음 - 002000 스키마 기준)
  INSERT INTO public.user_profiles (
    id,
    user_type,
    display_name,
    manner_temperature,
    is_verified,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    v_user_type,
    v_display_name,
    36.5,
    FALSE,
    TRUE,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- ================================================================
-- STEP 4: 트리거 생성
-- ================================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- STEP 5: RLS INSERT 정책 정리 (중복 제거)
-- ================================================================
-- 기존 INSERT 정책 모두 삭제
DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.user_profiles;

-- 하나의 깔끔한 INSERT 정책 생성
-- 참고: SECURITY DEFINER 함수는 RLS를 우회하므로 이건 클라이언트 직접 INSERT용
CREATE POLICY "user_profiles_insert" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ================================================================
-- STEP 6: 권한 확인
-- ================================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON public.user_profiles TO service_role;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- ================================================================
-- STEP 7: 함수 실행 권한
-- ================================================================
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- ================================================================
-- VERIFICATION: 트리거 테스트 (주석 해제하여 수동 테스트)
-- ================================================================
-- 아래를 실행하면 트리거가 제대로 작동하는지 확인 가능:
-- SELECT public.handle_new_user(); -- 이건 트리거 함수라 직접 호출은 안 됨
--
-- 대신 다음으로 확인:
-- SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
-- SELECT trigger_name FROM information_schema.triggers
--   WHERE event_object_schema = 'auth' AND event_object_table = 'users';
