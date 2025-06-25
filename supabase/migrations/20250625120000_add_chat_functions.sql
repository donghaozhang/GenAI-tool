-- Add database functions needed for chat functionality

-- Function to atomically create a session with the first message
CREATE OR REPLACE FUNCTION public.create_session_with_first_message(
  p_session_id UUID,
  p_model TEXT,
  p_provider TEXT,
  p_canvas_id UUID DEFAULT NULL,
  p_title TEXT DEFAULT 'New Chat',
  p_user_id UUID DEFAULT NULL,
  p_message_role TEXT DEFAULT 'user',
  p_message_content TEXT DEFAULT ''
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert the chat session
  INSERT INTO chat_sessions (
    id, title, model, provider, canvas_id, user_id, created_at, updated_at
  ) VALUES (
    p_session_id, p_title, p_model, p_provider, p_canvas_id, p_user_id, NOW(), NOW()
  );
  
  -- Insert the first message
  INSERT INTO chat_messages (
    session_id, role, content, created_at
  ) VALUES (
    p_session_id, p_message_role, p_message_content, NOW()
  );
  
  -- Return success result
  SELECT json_build_object(
    'session_id', p_session_id,
    'title', p_title,
    'success', true
  ) INTO result;
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error result
  SELECT json_build_object(
    'error', SQLERRM,
    'success', false
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.create_session_with_first_message TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_session_with_first_message TO service_role;