-- TUTTI Platform - Fix Chat RLS Infinite Recursion
-- Issue: chat_participants_select policy references itself causing infinite recursion
-- Fix: Simplify policy to use direct user_id check (non-recursive)
-- Created: 2026-02-19

-- ============================================================================
-- FIX: chat_participants RLS policy (infinite recursion)
-- ============================================================================
-- Problem: The original policy used a subquery on the same table it's securing:
--   USING (room_id IN (SELECT room_id FROM chat_participants WHERE user_id = auth.uid()))
-- This causes PostgreSQL to detect infinite recursion.
-- Solution: Use direct column check to see only own records.

DROP POLICY IF EXISTS "chat_participants_select" ON chat_participants;

CREATE POLICY "chat_participants_select" ON chat_participants
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- FIX: chat_rooms RLS policy (depends on broken chat_participants policy)
-- ============================================================================
-- chat_rooms relied on the recursive chat_participants query.
-- Since chat_participants_select is now fixed, chat_rooms can still
-- reference chat_participants safely (it's a cross-table query, not self-referential).
-- However, to ensure correctness we add a security definer function.

-- Create a helper function to get room IDs for the current user (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_user_room_ids(p_user_id UUID)
RETURNS TABLE(room_id UUID)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT cp.room_id FROM chat_participants cp WHERE cp.user_id = p_user_id;
$$;

-- Recreate chat_rooms policy using the helper function
DROP POLICY IF EXISTS "chat_rooms_select" ON chat_rooms;

CREATE POLICY "chat_rooms_select" ON chat_rooms
  FOR SELECT USING (
    id IN (SELECT get_user_room_ids(auth.uid()))
  );

-- Recreate chat_messages policies using the helper function
DROP POLICY IF EXISTS "chat_messages_select" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert" ON chat_messages;

CREATE POLICY "chat_messages_select" ON chat_messages
  FOR SELECT USING (
    room_id IN (SELECT get_user_room_ids(auth.uid()))
  );

CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    room_id IN (SELECT get_user_room_ids(auth.uid()))
  );
