-- TUTTI Platform - Fix Reviews RLS Security Issues
-- Fix 1: Add DELETE policy (prevent users from deleting reviews)
-- Fix 2: Update SELECT policy to use correct column name (revealed_at instead of is_visible)
-- Fix 3: Add constraint to prevent self-reviews
-- Created: 2026-02-20

-- ============================================================================
-- 1. DROP OLD REVIEWS POLICIES (may not exist in all migrations)
-- ============================================================================

DROP POLICY IF EXISTS "reviews_view_visible" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;

-- ============================================================================
-- 2. ADD CONSTRAINT TO PREVENT SELF-REVIEWS
-- ============================================================================

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS no_self_review;

ALTER TABLE reviews ADD CONSTRAINT no_self_review
  CHECK (reviewer_id != reviewee_id);

-- ============================================================================
-- 3. CREATE NEW REVIEWS RLS POLICIES
-- ============================================================================

-- Reviews: users can view revealed reviews or their own reviews
CREATE POLICY "reviews_view_own" ON reviews
  FOR SELECT USING (
    -- View if revealed to public
    revealed_at IS NOT NULL OR
    -- Or if user is the reviewer or reviewee
    (reviewer_id = auth.uid() OR reviewee_id = auth.uid())
  );

-- Reviews: users can insert their own reviews
CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (
    reviewer_id = auth.uid() AND
    reviewer_id != reviewee_id  -- Prevent self-review
  );

-- Reviews: users can only update their own reviews before they're revealed
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (
    reviewer_id = auth.uid() AND
    revealed_at IS NULL  -- Can only edit unrevealed reviews
  )
  WITH CHECK (
    reviewer_id = auth.uid() AND
    reviewer_id != reviewee_id
  );

-- Reviews: No DELETE allowed - reviews are permanent
-- (Implicitly denied by not having a DELETE policy)

-- ============================================================================
-- 4. FREEZE MANNER_TEMPERATURE UPDATES VIA RLS
-- ============================================================================

-- Create a trigger to prevent direct manner_temperature updates
-- This enforces that manner_temperature can ONLY be updated through
-- the manner_temperature_logs system (via stored procedure)

CREATE OR REPLACE FUNCTION prevent_direct_manner_temp_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if manner_temperature was actually changed
  IF OLD.manner_temperature IS DISTINCT FROM NEW.manner_temperature THEN
    -- Only allow if being called from a stored procedure (via service role)
    -- Regular users cannot modify this field directly
    IF current_user NOT IN ('postgres', 'supabase_admin') THEN
      RAISE EXCEPTION 'manner_temperature can only be updated through review system';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_prevent_manner_temp_update ON user_profiles;

CREATE TRIGGER trigger_prevent_manner_temp_update
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  WHEN (OLD.manner_temperature IS DISTINCT FROM NEW.manner_temperature)
  EXECUTE FUNCTION prevent_direct_manner_temp_update();

-- ============================================================================
-- 5. CREATE AUDIT FUNCTION FOR MANNER TEMPERATURE CHANGES
-- ============================================================================

CREATE OR REPLACE FUNCTION log_manner_temperature_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically log when manner_temperature changes
  IF OLD.manner_temperature IS DISTINCT FROM NEW.manner_temperature THEN
    INSERT INTO manner_temperature_logs (
      user_id,
      change_amount,
      reason
    ) VALUES (
      NEW.id,
      NEW.manner_temperature - OLD.manner_temperature,
      COALESCE(current_setting('application_settings.temp_change_reason', true), 'api_update')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_manner_temp_change ON user_profiles;

CREATE TRIGGER trigger_log_manner_temp_change
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  WHEN (OLD.manner_temperature IS DISTINCT FROM NEW.manner_temperature)
  EXECUTE FUNCTION log_manner_temperature_change();
