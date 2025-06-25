# Jaaz Integration Analysis

## What is Jaaz?

**Jaaz** is an AI Design Agent - a local and free alternative to Lovart. It's a comprehensive AI-powered creative application that enables users to design, edit, and generate images, posters, storyboards, and other creative content using an infinite canvas workspace combined with intelligent AI assistance.

## Integration Architecture

### Dual System Approach
The project employs a sophisticated dual-architecture approach:

1. **Main Project**: React-based AI marketplace/game interface with Supabase backend
2. **Jaaz Integration**: Complete copy of the Jaaz AI design agent system integrated as a subsystem

### Jaaz Source Structure (`/jaaz-source/`)

```
jaaz-source/
├── react/                        # Frontend React application
│   ├── src/components/           # Jaaz-specific UI components
│   ├── src/api/                  # API layer for Jaaz services
│   ├── src/hooks/                # Custom hooks for Jaaz functionality
│   └── src/stores/               # Zustand stores for state management
├── server/                       # FastAPI Python backend
│   ├── routers/                  # API route handlers
│   ├── services/                 # Business logic services
│   ├── tools/                    # AI tool integrations
│   └── utils/                    # Utility functions
├── electron/                     # Desktop app wrapper
└── assets/                       # Branding and icons
```

## Core Components Integration

### 1. Chat System
**Location**: `src/components/designer/chat/`

**Components**:
- `Chat.tsx` - Main chat interface
- `ChatHistory.tsx` - Message history management
- `ChatTextarea.tsx` - Input interface
- `Message/` - Various message type components
- `ModelSelector.tsx` - AI model selection

**Features**:
- Real-time streaming responses
- Tool call execution
- Multi-provider AI model support
- Message persistence and history

### 2. Canvas System
**Location**: `src/components/designer/canvas/`

**Components**:
- `Canvas.tsx` - Main canvas container
- `CanvasExcali.tsx` - Excalidraw integration
- `CanvasHeader.tsx` - Canvas toolbar
- `menu/` - Canvas tool menus
- `pop-bar/` - Context-sensitive popover bars

**Features**:
- Infinite canvas workspace
- Professional drawing tools
- Export to multiple formats (PNG, SVG, PDF)
- AI-generated content integration

### 3. Agent Studio
**Location**: `src/components/agent_studio/`

**Components**:
- `AgentStudio.tsx` - Main workflow editor
- `AgentNode.tsx` - Individual workflow nodes
- `AgentSettings.tsx` - Configuration interface

**Features**:
- Visual workflow editor
- Node-based AI task orchestration
- Pre-built AI operation templates
- Custom workflow creation

## Backend Integration (FastAPI)

### Server Configuration
- **Host**: `127.0.0.1:57988`
- **Framework**: FastAPI with WebSocket support
- **Proxy**: Vite development proxy forwards `/api` and `/socket.io` traffic

### Key Services

#### AI Provider Integration (`/server/tools/img_generators/`)
```python
# Supported AI providers
- base.py          # Base generator interface
- comfyui.py       # Local ComfyUI integration
- jaaz.py          # Jaaz cloud services
- openai.py        # OpenAI DALL-E
- replicate.py     # Replicate models
- wavespeed.py     # Wavespeed services
```

#### WebSocket Services (`/server/services/`)
- `websocket_service.py` - Real-time communication
- `chat_service.py` - AI conversation handling
- `stream_service.py` - Response streaming

### Database Integration
- **Local SQLite**: `user_data/localmanus.db`
- **Settings Storage**: `user_data/settings.json`
- **File Management**: `user_data/files/`

## API Layer Integration

### Main Project API (`src/api/`)

#### Jaaz-Specific APIs
- `auth.ts` - Device-based OAuth authentication
- `config.ts` - Provider configuration management
- `chat.ts` - Chat service integration
- `canvas.ts` - Canvas operations
- `settings.ts` - Settings management

#### Authentication Flow
```typescript
// Device-based OAuth flow
1. Request device code from Jaaz
2. User authenticates via browser (jaaz.app)
3. Client polls for authentication completion
4. Store access token for API calls
```

## AI Provider Configuration

### Supported Text Models
```typescript
const TEXT_MODELS = {
  'gpt-4o': 'OpenAI GPT-4o',
  'gpt-4o-mini': 'OpenAI GPT-4o Mini',
  'claude-sonnet-4': 'Anthropic Claude Sonnet 4',
  'claude-3-7-sonnet': 'Anthropic Claude 3.7 Sonnet',
  'deepseek-chat': 'DeepSeek Chat',
  // Local models via Ollama
}
```

### Supported Image Models
```typescript
const IMAGE_MODELS = {
  'google/imagen-4': 'Google Imagen 4',
  'flux-1.1-pro': 'Black Forest Labs FLUX 1.1 Pro',
  'flux-kontext-pro': 'FLUX Kontext Pro',
  'recraft-v3': 'Recraft v3',
  'gpt-image-1': 'OpenAI DALL-E',
  // Local generation via ComfyUI
}
```

## State Management Integration

### Zustand Stores (`src/components/designer/store/`)
- `chat.ts` - Chat state management
- `canvas.ts` - Canvas state and operations
- `configs.ts` - Configuration state
- `agent.ts` - Agent workflow state

### Custom Hooks (`src/hooks/jaaz/`)
- `use-balance.ts` - Account balance management
- `use-theme.ts` - Theme customization
- `use-language.ts` - Internationalization
- `use-notifications.ts` - User notifications
- `use-mobile.ts` - Mobile responsiveness

## Settings Integration

### JaazSetting Component (`src/components/settings/JaazSetting.tsx`)
**Features**:
- API provider configuration
- Model selection and settings
- Authentication management
- Local ComfyUI setup

### Configuration Management
```typescript
const DEFAULT_PROVIDERS_CONFIG = {
  jaaz: {
    models: { /* model definitions */ },
    url: `${BASE_API_URL}/api/v1/`,
    api_key: '',
    max_tokens: 8192,
  }
}
```

## Integration Status

### ✅ Completed Integration Phases
1. **Phase 1**: Complete chat system (6+ message components)
2. **Phase 2**: Full canvas system with Excalidraw
3. **Phase 3**: Agent studio with visual workflow editor
4. **Phase 4**: Settings, sidebar, and API layer (65+ files)

### 🔄 Current Integration Tasks
- Adaptation of Jaaz components for Supabase backend
- Integration testing of copied systems
- UI/UX unification between systems

## Key Technical Features

### Real-time Communication
```typescript
// WebSocket integration
socket.emit('chat_message', { message, session_id })
socket.on('chat_response', handleStreamingResponse)
```

### AI Tool Execution
```typescript
// Tool call handling
const toolCall = {
  type: 'image_generation',
  parameters: { prompt, model, settings }
}
await executeToolCall(toolCall)
```

### Canvas Integration
```typescript
// Excalidraw integration
const excalidrawAPI = useExcalidrawAPI()
excalidrawAPI.addElements(generatedElements)
```

## Security & Authentication

### Device-Based OAuth
- Secure authentication without storing credentials
- Browser-based user verification
- Automatic token refresh and management

### API Key Management
- Local storage of authentication tokens
- Provider-specific API key configuration
- Secure proxy for backend communication

## Performance Optimizations

### Code Splitting
- Dynamic imports for Jaaz components
- Lazy loading of heavy features
- Bundle optimization with Vite

### State Optimization
- Efficient Zustand state updates
- Minimal re-renders with proper selectors
- Memoization of expensive operations

This integration represents a comprehensive AI design agent system that transforms the project from a simple AI marketplace into a professional creative design platform with real-time collaboration, multi-provider AI access, and advanced visual workflow capabilities.