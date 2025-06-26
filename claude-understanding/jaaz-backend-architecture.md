# Jaaz Backend Architecture Analysis

## Overview

The Jaaz backend is a sophisticated Python-based server built on FastAPI, designed as a local desktop application that serves both an API and React frontend. It implements a real-time collaborative workspace with AI agent integration, canvas functionality, and multi-model AI support.

## Core Architecture

### Technology Stack
- **Framework**: FastAPI with Socket.IO for real-time communication
- **Database**: SQLite with async support (aiosqlite)
- **AI Integration**: LangGraph for agent orchestration
- **Real-time**: Socket.IO for WebSocket communication
- **Frontend**: React build served statically
- **Port**: 57988 (default)

### Project Structure

```
server/
├── main.py                 # FastAPI application entry point
├── routers/               # API route handlers
├── services/              # Business logic layer
├── tools/                 # AI tool integrations
├── models/                # Data models
├── utils/                 # Utility functions
├── user_data/             # Local SQLite database
└── asset/                 # Workflow templates
```

## Key Components

### 1. Main Application (`main.py`)

**Responsibilities:**
- FastAPI app initialization with lifespan management
- Router registration for all API endpoints
- Static file serving for React frontend
- Socket.IO integration for real-time communication
- No-cache headers for development

**Key Features:**
- Serves React build from `react/dist`
- Proxy-friendly localhost configuration
- UTF-8 encoding enforcement for emoji support

### 2. API Routers (`routers/`)

#### Agent Router (`agent.py`)
- **Endpoints**: `/api/list_models`, `/api/list_chat_sessions`, `/api/chat_session/{session_id}`
- **Features**: 
  - Ollama model discovery and integration
  - Multi-provider model listing (OpenAI, Anthropic, etc.)
  - Chat session management
  - Workspace file downloads

#### Chat Router (`chat_router.py`)
- **Endpoints**: `/api/chat`, `/api/cancel/{session_id}`
- **Features**:
  - Async chat request handling
  - Stream task cancellation
  - Integration with chat service layer

#### Canvas Router (`canvas.py`)
- **Purpose**: Canvas data persistence and management
- **Integration**: Excalidraw canvas state handling

#### WebSocket Router (`websocket_router.py`)
- **Features**: Real-time session updates and broadcasting

### 3. Services Layer (`services/`)

#### Database Service (`db_service.py`)
**Architecture:**
- Singleton pattern with async SQLite operations
- Migration-based schema management
- Support for canvases, chat sessions, messages, and ComfyUI workflows

**Key Methods:**
- `create_canvas()`, `list_canvases()`, `save_canvas_data()`
- `create_chat_session()`, `get_chat_history()`, `list_sessions()`
- `create_comfy_workflow()`, `list_comfy_workflows()`

#### Chat Service (`chat_service.py`)
**Workflow:**
1. Parse incoming chat data
2. Create new session if first message
3. Save message to database
4. Launch LangGraph multi-agent task
5. Manage stream task lifecycle
6. Broadcast completion via WebSocket

**Integration Points:**
- LangGraph agent orchestration
- Database persistence
- WebSocket notifications
- Stream task management

#### WebSocket Service (`websocket_service.py`)
**Features:**
- Session-based broadcasting
- Canvas-aware updates
- Error handling and logging
- Legacy compatibility layer

#### Migration System (`services/migrations/`)
**Schema Versions:**
- V1: Initial schema (chat_sessions, chat_messages)
- V2: Canvas support
- V3: ComfyUI workflow integration

### 4. Tools Integration (`tools/`)

#### Image Generators (`tools/img_generators/`)
**Supported Backends:**
- ComfyUI (local workflow execution)
- OpenAI (DALL-E integration)
- Replicate (cloud-based models)
- WaveSpeed (custom integration)
- Jaaz (internal tools)

**Architecture Pattern:**
- Base class with common interface
- Provider-specific implementations
- Async execution support

### 5. Database Schema

```sql
-- Chat Sessions
CREATE TABLE chat_sessions (
    id TEXT PRIMARY KEY,
    canvas_id TEXT,
    title TEXT,
    model TEXT,
    provider TEXT,
    created_at TEXT,
    updated_at TEXT
);

-- Chat Messages
CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    role TEXT,
    message TEXT (JSON),
    created_at TEXT
);

-- Canvases
CREATE TABLE canvases (
    id TEXT PRIMARY KEY,
    name TEXT,
    data TEXT (JSON),
    thumbnail TEXT,
    description TEXT,
    created_at TEXT,
    updated_at TEXT
);

-- ComfyUI Workflows
CREATE TABLE comfy_workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    api_json TEXT,
    description TEXT,
    inputs TEXT,
    outputs TEXT
);
```

## Communication Flow

### 1. HTTP API Flow
```
React Frontend → FastAPI Router → Service Layer → Database/External APIs
```

### 2. Real-time Flow
```
Chat Request → Chat Service → LangGraph Agent → WebSocket Broadcast → Frontend Updates
```

### 3. Canvas Collaboration
```
Canvas Change → Canvas Service → Database → WebSocket → Other Clients
```

## Key Features

### Multi-Model AI Support
- Dynamic model discovery from Ollama
- Support for multiple providers (OpenAI, Anthropic, local models)
- Model type categorization (text, image, etc.)

### Real-time Collaboration
- Socket.IO based session management
- Canvas state synchronization
- Chat message broadcasting
- Session-aware updates

### Extensible Tool System
- Plugin-based image generation
- ComfyUI workflow integration
- Custom tool development support

### Local-First Architecture
- SQLite database for offline capability
- Local file storage
- No external dependencies for core functionality

## Development Considerations

### Strengths
- Clean separation of concerns
- Async-first design
- Extensible architecture
- Real-time capabilities
- Local-first approach

### Areas for Enhancement
- Error handling consistency
- Configuration management centralization
- API documentation (OpenAPI/Swagger)
- Unit test coverage
- Logging standardization

## Integration Points

### Frontend Integration
- Static asset serving at `/assets`
- API prefix at `/api/*`
- WebSocket at `/socket.io`
- React Router compatibility

### External Services
- Ollama integration for local LLMs
- ComfyUI for image generation
- Multiple AI provider APIs
- File system operations

## Deployment Architecture

The application is designed as a desktop application that:
1. Runs a local server on port 57988
2. Serves the React frontend
3. Provides API endpoints for frontend consumption
4. Maintains local SQLite database
5. Supports real-time collaboration features

This architecture enables a rich, desktop-class experience while maintaining web technologies and real-time collaboration capabilities.