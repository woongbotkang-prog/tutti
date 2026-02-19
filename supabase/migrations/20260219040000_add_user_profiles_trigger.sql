-- Migration: Add user_profiles auto-creation trigger and INSERT RLS policy
-- Date: 2026-02-19

-- ================================================================
-- 1. Trigger function: Automatically create user_profile on signup
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    user_type,
    email,
    display_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'individual')::user_type,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- ================================================================
-- 2. Create trigger on auth.users
-- ================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- 3. Add INSERT RLS policy for user_profiles
-- ================================================================
CREATE POLICY "users_can_insert_own_profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ================================================================
-- 4. Grant necessary permissions
-- ================================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
