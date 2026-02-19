-- ================================================================
-- FIX: chat_participants SELECT 정책 수정
-- Date: 2026-02-19
--
-- 문제: chat_participants_select 정책이 user_id = auth.uid()로 설정되어
--       같은 채팅방의 다른 참여자 정보를 조회할 수 없음
--       → 채팅 목록에서 상대방 이름이 표시되지 않음
--
-- 해결: 같은 채팅방 참여자라면 서로의 참여 정보를 조회 가능하도록 수정
--       get_user_room_ids() SECURITY DEFINER 함수 사용 (무한 재귀 방지)
-- ================================================================

DROP POLICY IF EXISTS "chat_participants_select" ON chat_participants;

CREATE POLICY "chat_participants_select" ON chat_participants
  FOR SELECT USING (
    room_id IN (SELECT get_user_room_ids(auth.uid()))
  );
