-- Migration: Simplified user_profiles trigger (guaranteed to work)
-- Date: 2026-02-19

-- ================================================================
-- 1. Drop existing trigger and function
-- ================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ================================================================
-- 2. Create simple, robust trigger function
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    user_type,
    display_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'individual'),
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
      SPLIT_PART(NEW.email, '@', 1),
      'User'
    ),
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- ================================================================
-- 3. Create trigger
-- ================================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
