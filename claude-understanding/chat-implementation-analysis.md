# Jaaz Chat Implementation Analysis

## Overview

The Jaaz chat system is a sophisticated real-time AI chat interface built with React frontend and FastAPI backend, featuring multi-modal support, real-time WebSocket communication, and integration with multiple AI providers through LangGraph agents.

## Architecture Overview

```
Frontend (React) ←→ FastAPI Backend ←→ LangGraph Agents ←→ AI Providers
       ↓                    ↓
   WebSocket Client ←→ Socket.IO Server
       ↓                    ↓
   Real-time UI      SQLite Database
```

## Frontend Implementation

### Core Chat Component (`Chat.tsx`)

**Main Features:**
- Real-time message streaming with WebSocket integration
- Multi-modal message support (text, images, tool calls)
- Auto-scrolling with smart positioning
- Session management and URL state handling
- Canvas integration for image positioning

**Key State Management:**
```typescript
const [messages, setMessages] = useState<Message[]>([])
const [pending, setPending] = useState<PendingType>(false)
const [session, setSession] = useState<Session | null>(null)
const [expandingToolCalls, setExpandingToolCalls] = useState<string[]>([])
```

**WebSocket Event Handlers:**
- `handleDelta`: Streaming text updates
- `handleToolCall`: AI tool execution events
- `handleImageGenerated`: Image generation completion
- `handleProgressUpdate`: Tool execution progress

### Message Types and Components

#### Message Structure
```typescript
type Message = UserMessage | AssistantMessage | ToolResultMessage

type UserMessage = {
  role: 'user'
  content: MessageContent[] | string
}

type AssistantMessage = {
  role: 'assistant'
  tool_calls?: ToolCall[]
  content?: MessageContent[] | string
}
```

#### Specialized Message Components
1. **Regular Messages** (`Message/Regular.tsx`): Standard text/image messages
2. **Tool Call Tag** (`Message/ToolCallTag.tsx`): Expandable tool execution cards
3. **Tool Call Content** (`Message/ToolCallContent.tsx`): Tool results display
4. **Image Messages** (`Message/Image.tsx`): Canvas-integrated image display

### Input Interface (`ChatTextarea.tsx`)

**Advanced Features:**
- Multi-modal input (text + file uploads)
- Drag-and-drop support for images
- File preview with removal capability
- Auto-resizing textarea
- Model selection integration
- Send/cancel functionality

### API Integration (`api/chat.ts`)

**Core Functions:**
```typescript
// Retrieve chat session history
getChatSession(sessionId: string): Promise<Message[]>

// Send new messages to backend
sendMessages(payload: {
  sessionId: string
  canvasId: string
  newMessages: Message[]
  textModel: Model
  imageModel: Model
  systemPrompt: string | null
}): Promise<Message[]>

// Cancel ongoing chat stream
cancelChat(sessionId: string): Promise<any>
```

## Backend Implementation

### Chat Router (`routers/chat_router.py`)

**Endpoints:**
- `POST /api/chat`: Main chat processing endpoint
- `POST /api/cancel/{session_id}`: Stream cancellation

### Chat Service (`services/chat_service.py`)

**Workflow:**
1. Parse incoming chat data
2. Create new session if first message
3. Save message to database
4. Launch LangGraph multi-agent task
5. Manage stream task lifecycle
6. Broadcast completion via WebSocket

**Key Function:**
```python
async def handle_chat(data):
    messages = data.get('messages')
    session_id = data.get('session_id')
    canvas_id = data.get('canvas_id')
    text_model = data.get('text_model')
    image_model = data.get('image_model')
    
    # Create session and save message
    if len(messages) == 1:
        await db_service.create_chat_session(...)
    
    # Launch LangGraph agent
    task = asyncio.create_task(langgraph_multi_agent(...))
    add_stream_task(session_id, task)
    
    # Handle completion/cancellation
    await task
    remove_stream_task(session_id)
    await send_to_websocket(session_id, {'type': 'done'})
```

### LangGraph Service (`services/langgraph_service.py`)

**Purpose:** Orchestrates AI agents using LangGraph framework

**Key Features:**
- Multi-provider AI model support (OpenAI, Ollama, etc.)
- Tool integration (image generation, write_plan)
- React-style agent architecture
- Streaming response handling

**Tool System:**
```python
TOOL_MAP = {
    'generate_image': generate_image,
    'write_plan': write_plan_tool,
}
```

### WebSocket Integration

**Real-time Events:**
- `Delta`: Streaming text updates
- `ToolCall`: Tool execution start
- `ImageGenerated`: Image generation completion
- `ProgressUpdate`: Tool execution progress
- `done`: Chat completion

**WebSocket Service (`services/websocket_service.py`):**
```python
async def broadcast_session_update(session_id: str, canvas_id: str, event: dict)
async def send_to_websocket(session_id: str, event: dict)
```

## Data Flow

### 1. Chat Message Flow
```
User Input → ChatTextarea → sendMessages API
    ↓
FastAPI Router → Chat Service → LangGraph Agent
    ↓
AI Provider Response → WebSocket Events → Frontend Updates
    ↓
Database Persistence ← Message Storage
```

### 2. Real-time Communication
```
Backend Events → Socket.IO Server → WebSocket Client → React State Updates
```

### 3. Tool Execution Flow
```
AI Agent → Tool Call → Tool Execution → Progress Updates → Results
    ↓                    ↓                    ↓             ↓
WebSocket → Frontend → Loading State → Progress Bar → Content Display
```

## Key Features

### Multi-Modal Support
- **Text Messages**: Standard chat with markdown rendering
- **Image Messages**: Upload, display, and canvas integration
- **Tool Calls**: AI tool execution with expandable details
- **File Uploads**: Drag-and-drop with preview

### Real-time Capabilities
- **Streaming Responses**: Delta updates for text generation
- **Live Tool Execution**: Progress tracking for long operations
- **Session Synchronization**: Multi-client support
- **Cancellation Support**: Stop ongoing operations

### AI Integration
- **Multiple Providers**: OpenAI, Ollama, custom models
- **Tool System**: Extensible AI tool framework
- **LangGraph Agents**: React-style AI agent architecture
- **Model Selection**: Separate text and image model choice

### User Experience
- **Session Management**: Persistent chat sessions
- **Auto-scrolling**: Smart scroll behavior
- **Loading States**: Context-aware spinners
- **Error Handling**: Graceful failure handling
- **Internationalization**: Multi-language support

## Database Schema

### Chat Sessions
```sql
CREATE TABLE chat_sessions (
    id TEXT PRIMARY KEY,
    canvas_id TEXT,
    title TEXT,
    model TEXT,
    provider TEXT,
    created_at TEXT,
    updated_at TEXT
);
```

### Chat Messages
```sql
CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    role TEXT,
    message TEXT, -- JSON serialized Message object
    created_at TEXT
);
```

## Integration Points

### Canvas Integration
- Image positioning in Excalidraw canvas
- Chat context awareness of canvas state
- Shared session management

### Configuration System
- Model selection persistence
- Provider configuration
- System prompt management

### File System
- Local file uploads and storage
- Image processing and display
- File preview functionality

## Technical Considerations

### Performance
- Efficient WebSocket event handling
- Smart scroll optimization
- Lazy loading for large chat histories
- Stream task management for cancellation

### Security
- Input validation and sanitization
- File upload restrictions
- SQL injection prevention
- WebSocket connection security

### Scalability
- Async operations throughout
- Database connection pooling
- Stream task cleanup
- Memory management for large sessions

### Error Handling
- WebSocket reconnection logic
- API failure recovery
- Tool execution error handling
- User feedback for failures

## Development Best Practices

### Frontend
- TypeScript for type safety
- Component composition for reusability
- Custom hooks for logic separation
- State management with React context

### Backend
- Async/await patterns
- Service layer separation
- Database migrations
- Proper error propagation

### Real-time Communication
- Event-driven architecture
- Cleanup on disconnection
- Proper error handling
- State synchronization

This chat implementation represents a production-ready system with comprehensive features for AI-powered conversations, real-time collaboration, and seamless integration with the broader Jaaz application ecosystem.