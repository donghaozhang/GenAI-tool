-- Migration to improve referential integrity for chat sessions and messages
-- This ensures that messages cannot exist without their parent session

-- The chat_messages table already has proper CASCADE delete setup, but let's ensure it's explicit
-- and add some additional constraints for data integrity

-- Add a NOT NULL constraint on session_id if it doesn't exist
-- (it should already be NOT NULL from foreign key, but let's be explicit)
ALTER TABLE chat_messages 
ALTER COLUMN session_id SET NOT NULL;

-- Add a check constraint to ensure role is valid
-- (this constraint already exists, but let's ensure it's properly named)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_messages_role_check' 
        AND table_name = 'chat_messages'
    ) THEN
        ALTER TABLE chat_messages 
        ADD CONSTRAINT chat_messages_role_check 
        CHECK (role IN ('user', 'assistant', 'system'));
    END IF;
END $$;

-- Add a check constraint to ensure content is not empty
ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_content_not_empty 
CHECK (LENGTH(TRIM(content)) > 0);

-- Add a check constraint to ensure session titles are not empty when provided
ALTER TABLE chat_sessions 
ADD CONSTRAINT chat_sessions_title_not_empty 
CHECK (LENGTH(TRIM(title)) > 0);

-- Add an index on chat_messages for better query performance when fetching by session
-- (this index already exists, but ensuring it's optimal)
DROP INDEX IF EXISTS idx_chat_messages_session_id;
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id, created_at);

-- Add an index for session ordering by update time
DROP INDEX IF EXISTS idx_chat_sessions_updated_at;
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

-- Create a function to update chat_sessions.updated_at when messages are added
CREATE OR REPLACE FUNCTION update_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_sessions 
    SET updated_at = NOW() 
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update session timestamp when message is added
DROP TRIGGER IF EXISTS trigger_update_session_timestamp ON chat_messages;
CREATE TRIGGER trigger_update_session_timestamp
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_session_timestamp();

-- Create a stored procedure for atomically creating session and first message
CREATE OR REPLACE FUNCTION create_session_with_first_message(
    p_session_id UUID,
    p_model TEXT,
    p_provider TEXT,
    p_canvas_id UUID DEFAULT NULL,
    p_title TEXT DEFAULT 'New Chat',
    p_user_id UUID DEFAULT NULL,
    p_message_role TEXT DEFAULT 'user',
    p_message_content TEXT DEFAULT ''
)
RETURNS JSON AS $$
DECLARE
    v_session_data JSON;
    v_message_data JSON;
BEGIN
    -- Validate inputs
    IF p_session_id IS NULL THEN
        RAISE EXCEPTION 'Session ID cannot be null';
    END IF;
    
    IF p_message_role NOT IN ('user', 'assistant', 'system') THEN
        RAISE EXCEPTION 'Invalid message role: %', p_message_role;
    END IF;
    
    IF LENGTH(TRIM(p_message_content)) = 0 THEN
        RAISE EXCEPTION 'Message content cannot be empty';
    END IF;

    -- Start transaction (implicit in function)
    -- Insert session
    INSERT INTO chat_sessions (
        id, 
        model, 
        provider, 
        canvas_id, 
        title, 
        user_id, 
        created_at, 
        updated_at
    ) VALUES (
        p_session_id,
        p_model,
        p_provider,
        p_canvas_id,
        p_title,
        p_user_id,
        NOW(),
        NOW()
    )
    RETURNING json_build_object(
        'id', id,
        'model', model,
        'provider', provider,
        'canvas_id', canvas_id,
        'title', title,
        'user_id', user_id,
        'created_at', created_at,
        'updated_at', updated_at
    ) INTO v_session_data;

    -- Insert first message
    INSERT INTO chat_messages (
        session_id,
        role,
        content,
        created_at
    ) VALUES (
        p_session_id,
        p_message_role,
        p_message_content,
        NOW()
    )
    RETURNING json_build_object(
        'id', id,
        'session_id', session_id,
        'role', role,
        'content', content,
        'created_at', created_at
    ) INTO v_message_data;

    -- Return combined result
    RETURN json_build_object(
        'session', v_session_data,
        'message', v_message_data
    );
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_session_with_first_message TO authenticated;
GRANT EXECUTE ON FUNCTION create_session_with_first_message TO anon;
