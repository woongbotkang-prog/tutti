-- Migration: Fix user_profiles trigger - handle null/empty values properly
-- Date: 2026-02-19

-- ================================================================
-- 1. Drop existing trigger and function
-- ================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ================================================================
-- 2. Recreate trigger function with proper VARCHAR handling
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_type VARCHAR(20);
  v_display_name TEXT;
BEGIN
  -- Safely extract user_type with validation
  v_user_type := COALESCE(
    NEW.raw_user_meta_data->>'user_type',
    'individual'
  );
  
  -- Validate user_type
  IF v_user_type NOT IN ('individual', 'organization') THEN
    v_user_type := 'individual';
  END IF;

  -- Extract display_name, use email prefix if empty
  v_display_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Insert into user_profiles
  INSERT INTO public.user_profiles (
    id,
    user_type,
    email,
    display_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    v_user_type,
    NEW.email,
    v_display_name,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error and raise it for debugging
  RAISE WARNING 'Failed to create user_profile for user %: %', NEW.id, SQLERRM;
  RAISE;
END;
$$;

-- ================================================================
-- 3. Recreate trigger
-- ================================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- 4. Ensure RLS policies are correct
-- ================================================================
-- Drop existing INSERT policy if exists
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.user_profiles;

-- Recreate with proper conditions  
CREATE POLICY "users_can_insert_own_profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ================================================================
-- 5. Verify grants
-- ================================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
