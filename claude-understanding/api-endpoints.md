# API Endpoints and Backend Integration

## Backend Architecture Overview

### Dual Backend System
1. **Supabase Backend** - Primary database and authentication
2. **FastAPI Backend** - Jaaz AI services and real-time features

## Supabase Integration

### Database Configuration
- **URL**: `VITE_SUPABASE_URL` environment variable
- **API Key**: `VITE_SUPABASE_ANON_KEY` environment variable
- **Client**: `src/integrations/supabase/client.ts`

### Authentication Endpoints
```typescript
// Supabase Auth integration
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google' | 'twitter',
  options: {
    redirectTo: `${window.location.origin}/auth`
  }
})
```

### Edge Functions (`supabase/functions/`)

#### Payment Processing
```typescript
// Create payment intent
POST /functions/v1/create-payment-intent
Body: { amount: number, currency: string }
Response: { client_secret: string, payment_intent_id: string }

// Process payment success
POST /functions/v1/process-payment-success
Body: { payment_intent_id: string, user_id: string }
Response: { success: boolean, credits_added: number }

// Consume credits
POST /functions/v1/consume-credits
Body: { user_id: string, amount: number, description: string }
Response: { success: boolean, remaining_credits: number }
```

#### AI Processing
```typescript
// Main image processing pipeline
POST /functions/v1/process-image-pipeline
Body: {
  prompt: string,
  model: string,
  settings: object,
  user_id: string
}
Response: {
  success: boolean,
  image_url?: string,
  error?: string
}

// Pokemon image generation
POST /functions/v1/generate-pokemon-images
Body: { prompt: string, count: number }
Response: { images: string[], success: boolean }

// ElevenLabs video processing
POST /functions/v1/process-elevenlabs-video
Body: { audio_url: string, image_url: string }
Response: { video_url: string, success: boolean }

// GPT chat completions
POST /functions/v1/chat-with-gpt
Body: { messages: Message[], model: string }
Response: { response: string, usage: object }
```

## FastAPI Backend (Jaaz)

### Server Configuration
- **Host**: `127.0.0.1:57988`
- **Framework**: FastAPI with WebSocket support
- **Proxy Path**: `/api` and `/socket.io`

### API Layer (`src/api/`)

#### Authentication API (`src/api/auth.ts`)
```typescript
// Device authentication flow
POST /api/v1/auth/device/code
Response: {
  device_code: string,
  user_code: string,
  verification_uri: string,
  expires_in: number
}

POST /api/v1/auth/device/token
Body: { device_code: string }
Response: {
  access_token?: string,
  token_type?: string,
  error?: string
}

GET /api/v1/auth/user
Headers: { Authorization: `Bearer ${token}` }
Response: {
  id: string,
  email: string,
  name: string,
  avatar_url?: string
}
```

#### Configuration API (`src/api/config.ts`)
```typescript
// Get provider configurations
GET /api/v1/configs
Response: {
  providers: {
    [key: string]: {
      models: object,
      url: string,
      api_key: string,
      max_tokens: number
    }
  }
}

// Update provider configuration
PUT /api/v1/configs
Body: { providers: object }
Response: { success: boolean }

// Get available models
GET /api/v1/models
Response: {
  text_models: string[],
  image_models: string[],
  available_providers: string[]
}
```

#### Chat API (`src/api/chat.ts`)
```typescript
// Send chat message
POST /api/v1/chat/message
Body: {
  message: string,
  session_id: string,
  model: string,
  stream: boolean
}
Response: {
  response: string,
  message_id: string,
  usage?: object
}

// Get chat sessions
GET /api/v1/chat/sessions
Response: {
  sessions: {
    id: string,
    title: string,
    created_at: string,
    updated_at: string
  }[]
}

// Delete chat session
DELETE /api/v1/chat/sessions/{session_id}
Response: { success: boolean }
```

#### Canvas API (`src/api/canvas.ts`)
```typescript
// Get canvas list
GET /api/v1/canvases
Response: {
  canvases: {
    id: string,
    title: string,
    thumbnail?: string,
    created_at: string,
    updated_at: string
  }[]
}

// Save canvas
POST /api/v1/canvases
Body: {
  title: string,
  elements: object[],
  app_state: object
}
Response: {
  canvas_id: string,
  success: boolean
}

// Load canvas
GET /api/v1/canvases/{canvas_id}
Response: {
  id: string,
  title: string,
  elements: object[],
  app_state: object
}

// Update canvas
PUT /api/v1/canvases/{canvas_id}
Body: {
  title?: string,
  elements?: object[],
  app_state?: object
}
Response: { success: boolean }

// Delete canvas
DELETE /api/v1/canvases/{canvas_id}
Response: { success: boolean }
```

#### Settings API (`src/api/settings.ts`)
```typescript
// Get user settings
GET /api/v1/settings
Response: {
  theme: string,
  language: string,
  ai_providers: object,
  canvas_settings: object
}

// Update settings
PUT /api/v1/settings
Body: {
  theme?: string,
  language?: string,
  ai_providers?: object,
  canvas_settings?: object
}
Response: { success: boolean }
```

#### Billing API (`src/api/billing.ts`)
```typescript
// Get account balance
GET /api/v1/billing/balance
Headers: { Authorization: `Bearer ${token}` }
Response: {
  balance: number,
  currency: string,
  last_updated: string
}

// Get usage history
GET /api/v1/billing/usage
Query: { limit?: number, offset?: number }
Response: {
  usage: {
    date: string,
    amount: number,
    description: string,
    model: string
  }[],
  total: number
}
```

#### Upload API (`src/api/upload.ts`)
```typescript
// Upload file
POST /api/v1/upload
Body: FormData with file
Response: {
  url: string,
  filename: string,
  size: number,
  mime_type: string
}

// Get uploaded files
GET /api/v1/files
Response: {
  files: {
    id: string,
    filename: string,
    url: string,
    size: number,
    created_at: string
  }[]
}
```

#### Model API (`src/api/model.ts`)
```typescript
// Generate image
POST /api/v1/models/generate/image
Body: {
  prompt: string,
  model: string,
  width?: number,
  height?: number,
  steps?: number,
  guidance?: number
}
Response: {
  image_url: string,
  seed: number,
  parameters: object
}

// Generate text
POST /api/v1/models/generate/text
Body: {
  prompt: string,
  model: string,
  max_tokens?: number,
  temperature?: number
}
Response: {
  text: string,
  usage: {
    prompt_tokens: number,
    completion_tokens: number,
    total_tokens: number
  }
}
```

## WebSocket Integration

### Socket.IO Events (`src/lib/socket.ts`)

#### Chat Events
```typescript
// Client to Server
socket.emit('chat_message', {
  message: string,
  session_id: string,
  model: string
})

socket.emit('join_session', { session_id: string })
socket.emit('leave_session', { session_id: string })

// Server to Client
socket.on('chat_response', (data: {
  message: string,
  message_id: string,
  is_complete: boolean
}))

socket.on('chat_error', (error: {
  message: string,
  code: string
}))
```

#### Canvas Events
```typescript
// Real-time canvas collaboration
socket.emit('canvas_update', {
  canvas_id: string,
  elements: object[],
  app_state: object
})

socket.on('canvas_updated', (data: {
  canvas_id: string,
  elements: object[],
  user_id: string
}))
```

#### System Events
```typescript
socket.on('connect', () => {
  console.log('Connected to server')
})

socket.on('disconnect', (reason: string) => {
  console.log('Disconnected:', reason)
})

socket.on('balance_updated', (data: {
  new_balance: number,
  change: number
}))
```

## External API Integrations

### AI Provider APIs
```typescript
// OpenAI API
const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1'
}

// Anthropic API
const anthropicConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://api.anthropic.com/v1'
}

// FAL.ai API
const falConfig = {
  apiKey: process.env.FAL_KEY,
  baseURL: 'https://fal.run/fal-ai'
}
```

### Stripe Integration (`src/services/stripe.ts`)
```typescript
// Payment processing
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount * 100, // cents
  currency: 'usd',
  metadata: { user_id, credits }
})

// Webhook handling
const webhook = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
)
```

## Error Handling

### API Error Responses
```typescript
interface APIError {
  error: string
  message: string
  code: number
  details?: object
}

// Example error responses
{
  error: "INSUFFICIENT_CREDITS",
  message: "Not enough credits to complete this operation",
  code: 402,
  details: { required: 10, available: 5 }
}

{
  error: "INVALID_MODEL",
  message: "The specified model is not available",
  code: 400,
  details: { model: "invalid-model", available: ["gpt-4", "claude-3"] }
}
```

### Rate Limiting
```typescript
// Rate limit headers
'X-RateLimit-Limit': '100'
'X-RateLimit-Remaining': '95'
'X-RateLimit-Reset': '1640995200'
```

This comprehensive API structure supports both the marketplace functionality and the advanced Jaaz design agent features, providing a robust foundation for AI-powered creative applications.