-- ================================================================
-- FIX: chat_messages Realtime 활성화
-- Date: 2026-02-19
--
-- 근본 원인: chat_messages 테이블이 supabase_realtime publication에
--           등록되지 않아 실시간 구독(postgres_changes)이 작동하지 않음
--
-- 수정 내용:
-- 1. chat_messages에 REPLICA IDENTITY FULL 설정 (필터 지원)
-- 2. supabase_realtime publication에 chat_messages 추가
-- ================================================================

-- REPLICA IDENTITY FULL: Realtime 필터(room_id=eq.xxx)가 작동하려면 필요
ALTER TABLE chat_messages REPLICA IDENTITY FULL;

-- Realtime publication에 추가
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
