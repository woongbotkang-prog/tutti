-- ================================================================
-- FIX: 지원 수락 시 채팅방 자동 생성 트리거
-- Date: 2026-02-19
--
-- 문제: 프론트엔드 RPC 호출에만 의존 → 네트워크/타이밍 이슈로 채팅방 미생성
-- 해결: DB 트리거로 applications.status가 'accepted'로 변경될 때 자동 생성
-- ================================================================

-- ================================================================
-- STEP 1: 지원 수락 시 채팅방 자동 생성 트리거 함수
-- ================================================================
CREATE OR REPLACE FUNCTION public.auto_create_chat_on_accept()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id UUID;
  v_gig_owner_id UUID;
BEGIN
  -- status가 'accepted'로 변경된 경우에만 실행
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    -- 이미 채팅방이 있는지 확인
    IF EXISTS (SELECT 1 FROM chat_rooms WHERE application_id = NEW.id) THEN
      RETURN NEW;
    END IF;

    -- 공고 작성자 ID 가져오기
    SELECT user_id INTO v_gig_owner_id
    FROM gigs
    WHERE id = NEW.gig_id;

    IF v_gig_owner_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- 채팅방 생성
    INSERT INTO chat_rooms (application_id, room_type)
    VALUES (NEW.id, 'direct')
    RETURNING id INTO v_room_id;

    -- 참여자 추가 (공고 작성자 + 지원자)
    INSERT INTO chat_participants (room_id, user_id)
    VALUES
      (v_room_id, v_gig_owner_id),
      (v_room_id, NEW.applicant_id);
  END IF;

  RETURN NEW;
END;
$$;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_application_accepted ON applications;
CREATE TRIGGER on_application_accepted
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_chat_on_accept();

-- ================================================================
-- STEP 2: 기존 accepted 지원 중 채팅방 없는 건 보정
-- ================================================================
DO $$
DECLARE
  r RECORD;
  v_room_id UUID;
  v_gig_owner_id UUID;
BEGIN
  FOR r IN
    SELECT a.id AS app_id, a.applicant_id, a.gig_id
    FROM applications a
    LEFT JOIN chat_rooms cr ON cr.application_id = a.id
    WHERE a.status = 'accepted'
      AND cr.id IS NULL
  LOOP
    -- 공고 작성자 가져오기
    SELECT user_id INTO v_gig_owner_id
    FROM gigs WHERE id = r.gig_id;

    IF v_gig_owner_id IS NOT NULL THEN
      -- 채팅방 생성
      INSERT INTO chat_rooms (application_id, room_type)
      VALUES (r.app_id, 'direct')
      RETURNING id INTO v_room_id;

      -- 참여자 추가
      INSERT INTO chat_participants (room_id, user_id)
      VALUES
        (v_room_id, v_gig_owner_id),
        (v_room_id, r.applicant_id);
    END IF;
  END LOOP;
END;
$$;
