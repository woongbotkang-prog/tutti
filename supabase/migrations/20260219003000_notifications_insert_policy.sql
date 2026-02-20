-- Allow authenticated users to insert notifications ONLY for themselves
-- SECURITY FIX: Prevent users from sending notifications to other users
CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
