-- ================================================================
-- FIX: 공고 수락 시 채팅방 생성 안 되는 버그 수정
-- Date: 2026-02-19
--
-- 근본 원인: chat_participants 테이블에 INSERT RLS 정책 누락
-- - chat_rooms INSERT는 WITH CHECK(TRUE)로 허용됨
-- - chat_participants INSERT 정책이 없어 RLS가 모든 INSERT 차단
-- - 결과: 채팅방은 생성되지만 참여자가 없는 유령 채팅방
--
-- 수정 내용:
-- 1. chat_participants INSERT 정책 추가
-- 2. SECURITY DEFINER 함수로 채팅방+참여자 원자적 생성
-- 3. 기존 유령 채팅방 정리
-- ================================================================

-- ================================================================
-- STEP 1: chat_participants INSERT 정책 추가 (안전망)
-- ================================================================
DROP POLICY IF EXISTS "chat_participants_insert" ON chat_participants;

-- 인증된 사용자가 참여자를 추가할 수 있도록 허용
-- 실제 채팅방 생성은 SECURITY DEFINER 함수를 통해 수행됨
CREATE POLICY "chat_participants_insert" ON chat_participants
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ================================================================
-- STEP 2: 채팅방 원자적 생성 함수 (SECURITY DEFINER)
-- ================================================================
-- 이 함수는 RLS를 우회하여 채팅방과 참여자를 한 번에 생성합니다.
-- 클라이언트에서 supabase.rpc('create_chat_room_for_application', {...})로 호출

CREATE OR REPLACE FUNCTION public.create_chat_room_for_application(
  p_application_id UUID,
  p_gig_owner_id UUID,
  p_applicant_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id UUID;
  v_existing_room_id UUID;
BEGIN
  -- 1. 이미 이 application에 대한 채팅방이 있는지 확인
  SELECT id INTO v_existing_room_id
  FROM chat_rooms
  WHERE application_id = p_application_id
  LIMIT 1;

  IF v_existing_room_id IS NOT NULL THEN
    -- 이미 존재하면 참여자가 있는지 확인하고 없으면 추가
    INSERT INTO chat_participants (room_id, user_id)
    VALUES (v_existing_room_id, p_gig_owner_id)
    ON CONFLICT (room_id, user_id) DO NOTHING;

    INSERT INTO chat_participants (room_id, user_id)
    VALUES (v_existing_room_id, p_applicant_id)
    ON CONFLICT (room_id, user_id) DO NOTHING;

    RETURN v_existing_room_id;
  END IF;

  -- 2. application이 존재하고 accepted 상태인지 확인
  IF NOT EXISTS (
    SELECT 1 FROM applications
    WHERE id = p_application_id
      AND status = 'accepted'
  ) THEN
    RAISE EXCEPTION 'Application not found or not accepted';
  END IF;

  -- 3. 채팅방 생성
  INSERT INTO chat_rooms (application_id, room_type)
  VALUES (p_application_id, 'direct')
  RETURNING id INTO v_room_id;

  -- 4. 참여자 추가
  INSERT INTO chat_participants (room_id, user_id)
  VALUES
    (v_room_id, p_gig_owner_id),
    (v_room_id, p_applicant_id);

  RETURN v_room_id;
END;
$$;

-- 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.create_chat_room_for_application(UUID, UUID, UUID)
  TO authenticated;

-- ================================================================
-- STEP 3: 기존 유령 채팅방 정리 (참여자 없는 채팅방)
-- ================================================================
-- 참여자가 0명인 채팅방을 찾아서 삭제
DELETE FROM chat_rooms
WHERE id NOT IN (
  SELECT DISTINCT room_id FROM chat_participants
);

-- ================================================================
-- STEP 4: chat_participants DELETE 정책 (선택적 - 나가기 기능용)
-- ================================================================
DROP POLICY IF EXISTS "chat_participants_delete" ON chat_participants;

CREATE POLICY "chat_participants_delete" ON chat_participants
  FOR DELETE USING (auth.uid() = user_id);
