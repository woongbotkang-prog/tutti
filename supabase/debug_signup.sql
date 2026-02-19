-- ================================================================
-- TUTTI 회원가입 에러 진단 스크립트
-- Supabase Dashboard → SQL Editor에서 실행하세요
-- ================================================================

-- 1. user_profiles 테이블의 실제 컬럼 확인
-- (email 컬럼이 있으면 안 됨 - 002000에서 제거됨)
SELECT '=== 1. user_profiles 컬럼 목록 ===' as step;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 2. 현재 활성 트리거 함수 정의 확인
-- (email INSERT가 있으면 문제)
SELECT '=== 2. handle_new_user 함수 정의 ===' as step;
SELECT prosrc
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 3. 트리거 존재 확인
SELECT '=== 3. auth.users 트리거 목록 ===' as step;
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- 4. user_profiles RLS 정책 확인
SELECT '=== 4. user_profiles RLS 정책 ===' as step;
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'user_profiles';

-- 5. 고아 auth.users 레코드 (user_profiles 없는)
SELECT '=== 5. 고아 auth.users 레코드 ===' as step;
SELECT au.id, au.email, au.created_at, au.raw_user_meta_data
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 6. user_profiles CHECK 제약조건 확인
SELECT '=== 6. user_profiles 제약조건 ===' as step;
SELECT conname, pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint
WHERE conrelid = 'public.user_profiles'::regclass;

-- 7. handle_new_user 함수 속성 (SECURITY DEFINER 등)
SELECT '=== 7. handle_new_user 함수 속성 ===' as step;
SELECT proname, prosecdef as is_security_definer, proconfig
FROM pg_proc
WHERE proname = 'handle_new_user';
