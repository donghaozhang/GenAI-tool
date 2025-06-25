-- Allow NULL user_id for anonymous chat sessions during development
ALTER TABLE chat_sessions ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow anonymous sessions for development
-- (In production, these should be more restrictive)

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON chat_sessions;

DROP POLICY IF EXISTS "Users can view messages from their sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages to their sessions" ON chat_messages;

-- Create more permissive policies for development
CREATE POLICY "Allow anonymous chat sessions" ON chat_sessions
  FOR ALL USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Allow anonymous chat messages" ON chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND (chat_sessions.user_id IS NULL OR chat_sessions.user_id = auth.uid())
    )
  );