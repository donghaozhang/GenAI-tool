# FK Error Reproduction Log

## Summary
Successfully reproduced the `chat_messages_session_id_fkey` foreign key constraint violation.

## Database Schema
- **chat_sessions**: Primary table with `id` as UUID primary key
- **chat_messages**: Child table with `session_id` referencing `chat_sessions(id)`
- **Foreign Key Constraint**: `chat_messages_session_id_fkey` FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE

## Root Cause Identified

The issue is in the `handleChat` method in `/supabase/functions/jaaz-chat/index.ts` (lines 135-173):

```typescript
async handleChat(data: ChatRequest): Promise<ChatMessage[]> {
  const { messages, session_id, canvas_id, text_model, image_model, system_prompt } = data

  try {
    // BUG: Only creates session if messages.length === 1
    if (messages.length === 1) {
      // Create session...
    }

    // PROBLEM: Always tries to save message regardless of session existence
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      await this.dbService.createMessage(session_id, lastMessage.role, ...)
      // ^^^^ This fails with FK error if session doesn't exist
    }
  }
}
```

## Exact Sequence That Triggers the Error

### Scenario 1: Multiple Messages in First Request (REPRODUCED ✅)

1. **API Call**: POST /jaaz-chat/api/chat
2. **Payload**: 
   ```json
   {
     "session_id": "a06c340e-c287-4274-aa32-d196097e3b46",
     "messages": [
       { "role": "system", "content": "You are a helpful AI assistant." },
       { "role": "user", "content": "Hello, can you help me design something?" }
     ]
   }
   ```
3. **Logic Flow**:
   - `messages.length` = 2 (system + user message)
   - Session creation check: `if (messages.length === 1)` → **FALSE**
   - Session creation is **SKIPPED**
   - Message insertion: `createMessage(session_id, ...)` is attempted
   - **FK VIOLATION**: Session `a06c340e-c287-4274-aa32-d196097e3b46` doesn't exist

### Captured SQL Error:
```
Error code: 23503
Message: insert or update on table "chat_messages" violates foreign key constraint "chat_messages_session_id_fkey"
Details: Key (session_id)=(a06c340e-c287-4274-aa32-d196097e3b46) is not present in table "chat_sessions".
```

## When This Occurs in Practice

1. **System Prompt + User Message**: When frontend sends both system prompt and user message in first request
2. **Multi-turn Context**: When replaying conversation history (multiple messages at once)
3. **Batch Processing**: When processing multiple messages in a single API call

## Impact

- **User Experience**: Chat functionality fails with cryptic DB error
- **Data Integrity**: Partial data state (no session but attempting to create messages)
- **Error Handling**: Poor error propagation to frontend

## Database State After Reproduction

### Chat Sessions: 1
- a33cb3b7-85a8-4c49-bc1b-701c50346699: "Message 1: Hello from concurrent request 1"

### Chat Messages: 2  
- user message in session a33cb3b7-85a8-4c49-bc1b-701c50346699
- assistant error message in session a33cb3b7-85a8-4c49-bc1b-701c50346699

## Recommended Fix

Change the session creation logic from:
```typescript
if (messages.length === 1) {
  // Create session
}
```

To:
```typescript
// Check if session exists first
const sessionExists = await this.dbService.sessionExists(session_id);
if (!sessionExists) {
  // Create session
}
```

## Test Environment Details

- **Local Supabase**: http://127.0.0.1:54321
- **Database**: PostgreSQL via Supabase local instance
- **Functions**: Edge Runtime serving jaaz-chat function
- **Test Method**: Node.js script with multiple concurrent scenarios

## Reproduction Timestamp
2025-06-25T07:58:57.333Z

---

**Status**: ✅ FK Error Successfully Reproduced and Root Cause Identified
