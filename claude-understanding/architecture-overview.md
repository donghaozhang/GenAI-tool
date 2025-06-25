# Architecture Overview

## Project Name
**GenAI-tool / marketartai** - AI Model Marketplace with Jaaz Integration

## High-Level Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.4.1
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand 4.5.7
- **Routing**: React Router DOM 6.26.2
- **HTTP Client**: TanStack React Query 5.81.2

### Backend Systems

#### Primary Backend (Supabase)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with OAuth (Google, Twitter)
- **Edge Functions**: TypeScript-based serverless functions
- **Real-time**: Supabase real-time subscriptions

#### Secondary Backend (Jaaz FastAPI)
- **Framework**: FastAPI (Python)
- **AI Integration**: Multi-provider AI services
- **WebSocket**: Socket.IO for real-time communication
- **Local AI**: ComfyUI integration for local image generation

### Key Integrations

#### AI Services
- **Text Generation**: OpenAI GPT-4, Anthropic Claude, DeepSeek
- **Image Generation**: Google Imagen, FLUX models, DALL-E, Recraft
- **Audio**: ElevenLabs integration
- **3D Models**: Hunyuan3D generation

#### Payment & Billing
- **Payment Processor**: Stripe integration
- **Credits System**: Custom credit-based billing
- **Subscription**: Pricing plans with tiered access

#### Development Tools
- **Testing**: Vitest with React Testing Library
- **Linting**: ESLint with TypeScript rules
- **Code Quality**: Lovable-tagger for development

## Directory Structure

```
/
├── src/                          # Main React application
│   ├── components/               # UI components
│   │   ├── marketplace/          # AI marketplace components
│   │   ├── designer/             # Canvas and chat system
│   │   ├── agent_studio/         # Visual workflow editor
│   │   └── ui/                   # Reusable UI components
│   ├── pages/                    # Route components
│   ├── api/                      # API layer abstraction
│   ├── hooks/                    # Custom React hooks
│   ├── contexts/                 # React contexts
│   └── utils/                    # Utility functions
├── jaaz-source/                  # Complete Jaaz application
│   ├── react/                    # Jaaz React frontend
│   ├── server/                   # FastAPI Python backend
│   └── electron/                 # Desktop application
├── supabase/                     # Supabase configuration
│   ├── functions/                # Edge functions
│   └── migrations/               # Database migrations
└── scripts/                      # Development and OAuth scripts
```

## Deployment Architecture

### Production Environment
- **Frontend**: Vercel hosting with automatic deployments
- **Database**: Supabase managed PostgreSQL
- **Edge Functions**: Supabase Edge Runtime
- **CDN**: Vercel Edge Network

### Development Environment
- **Frontend**: Vite dev server (port 8080)
- **Backend**: FastAPI server (port 57988)
- **Database**: Supabase local or remote
- **Proxy**: Vite proxy for API and WebSocket traffic

## Security Features
- **Environment Variables**: Secure configuration management
- **Authentication**: JWT tokens with Supabase Auth
- **API Keys**: Secure provider API key storage
- **CORS**: Proper cross-origin resource sharing
- **OAuth**: Social authentication with Google/Twitter

## Scalability Considerations
- **Modular Architecture**: Separation of concerns between components
- **State Management**: Efficient state updates with Zustand
- **Code Splitting**: Dynamic imports for better performance
- **Caching**: React Query for data caching and synchronization
- **Real-time Updates**: WebSocket and Supabase real-time for live features