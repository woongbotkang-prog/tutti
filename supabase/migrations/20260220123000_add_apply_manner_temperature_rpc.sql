-- TUTTI Platform - Apply manner temperature through review RPC
-- Created: 2026-02-20

CREATE OR REPLACE FUNCTION apply_manner_temperature_from_review(
  p_reviewee_id UUID,
  p_score INT,
  p_review_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_temp NUMERIC;
  temperature_change NUMERIC := 0;
  new_temp NUMERIC;
  reason_text TEXT;
BEGIN
  IF p_score < 1 OR p_score > 5 THEN
    RAISE EXCEPTION 'score must be between 1 and 5';
  END IF;

  IF p_score >= 4 THEN
    temperature_change := 0.2;
  ELSIF p_score >= 3 THEN
    temperature_change := 0.1;
  ELSE
    temperature_change := -0.2;
  END IF;

  SELECT manner_temperature
  INTO current_temp
  FROM user_profiles
  WHERE id = p_reviewee_id
  FOR UPDATE;

  IF current_temp IS NULL THEN
    current_temp := 36.5;
  END IF;

  new_temp := GREATEST(30, current_temp + temperature_change);
  reason_text := format('review_received_%s_stars', p_score);

  PERFORM set_config('application_settings.temp_change_reason', reason_text, true);

  UPDATE user_profiles
  SET manner_temperature = new_temp
  WHERE id = p_reviewee_id;

  UPDATE manner_temperature_logs
  SET related_review_id = p_review_id
  WHERE id = (
    SELECT id
    FROM manner_temperature_logs
    WHERE user_id = p_reviewee_id
      AND reason = reason_text
      AND related_review_id IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  );
END;
$$;

GRANT EXECUTE ON FUNCTION apply_manner_temperature_from_review(UUID, INT, UUID) TO authenticated;
