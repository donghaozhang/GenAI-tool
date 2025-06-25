# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Environment Management
- `npm run env:local` - Switch to local Supabase environment
- `npm run env:remote` - Switch to remote Supabase environment
- `npm run dev:local` - Switch to local environment and start dev server
- `npm run dev:remote` - Switch to remote environment and start dev server

### Core Development
- `npm run dev` - Start development server (Vite on port 8080)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Testing
- `npm test` or `npm run test` - Run all tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:run` - Run tests once without watch mode
- `npm run test:coverage` - Run tests with coverage report

### Local Supabase
- `npm run local:supabase` - Start local Supabase instance
- `npm run local:stop` - Stop local Supabase instance
- `supabase functions deploy --no-verify-jwt` - Deploy Edge Functions locally

### Deployment
- `npm run deploy:vercel` - Deploy to Vercel
- `npm run deploy:vercel:prod` - Deploy to Vercel production
- `npm run deploy:functions` - Deploy Supabase Edge Functions

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (authentication, database, Edge Functions)
- **State Management**: React Context + Zustand
- **Routing**: React Router
- **Testing**: Vitest + Testing Library
- **3D Graphics**: Three.js + React Three Fiber

### Main Application Structure
- **Entry Point**: `src/main.tsx` → `src/App.tsx`
- **Landing Page**: `src/pages/Index.tsx` (redirects authenticated users to marketplace)
- **Core App**: `src/pages/AIModelMarketplace.tsx` (main AI marketplace interface)
- **AI Designer**: `src/pages/designer/AIDesigner.tsx` (integrated Jaaz chat and canvas system)

### Key Components Architecture

#### Marketplace Components (`src/components/marketplace/`)
- `UnifiedGenerationInterface.tsx` - Main interface with single/batch mode toggle and model selection
- `ModelSelector.tsx` - Single and multi-select model picker with type indicators
- `BatchResultsDisplay.tsx` - Dedicated component for displaying batch generation results
- `ImageUploadSection.tsx` - File upload with data URL conversion for API compatibility
- `ImagePipeline.tsx` - Multi-step image processing pipeline with clothes changing support
- `MultiImageDisplay.tsx` - Display generated/uploaded images with advanced viewing options

#### Designer Components (`src/components/designer/`)
- **Chat System**: Full-featured chat interface with AI model selection and conversation management
- **Canvas System**: Excalidraw-based canvas with drawing tools and collaborative features
- **Integration**: Unified chat and canvas workspace from Jaaz system

#### UI Components (`src/components/ui/`)
- Complete shadcn/ui component library
- Custom components: `shiny-text.tsx`, `google-icon.tsx`

### Data Layer & Configuration

#### Models & Constants (`src/constants/`)
- `models.ts` - Centralized AI model definitions with full fal-ai format IDs
- Extensive model collection including FLUX variants, Imagen, SeedDream, Hailuo, Kling Video
- Model types: Text-to-Image, Image-to-Image, Image-to-Video, Text-to-Video, Video-to-Audio, Image-to-3D

#### Environment Configuration (`src/config/env.ts`)
- **Dynamic environment switching** between local and remote Supabase
- Automatic configuration detection with console logging
- Centralized config object for all API endpoints and settings

#### API Layer (`src/api/`)
- `chat.ts` - Chat API integration
- `canvas.ts` - Canvas operations
- `upload.ts` - File upload handling
- `auth.ts` - Authentication services
- `model.ts` - AI model interactions

### Backend Services

#### Supabase Edge Functions (`supabase/functions/`)
- `process-image-pipeline/` - Multi-step image processing with fal-ai integration
- `generate-pokemon-images/` - Image generation with proper FAL API handling
- `process-elevenlabs-video/` - Video processing with ElevenLabs audio synthesis
- `chat-with-gpt/` - Chat completions API
- `create-payment-intent/` - Stripe payment processing

#### Database (`supabase/migrations/`)
- Credits system for usage tracking
- User management and authentication

### State Management

#### Contexts (`src/contexts/`)
- `AuthContext.tsx` - User authentication state
- `CanvasContext.tsx` - Canvas state management
- `ConfigsContext.tsx` - Application configuration

#### Zustand Stores (`src/components/designer/store/`)
- `chat.ts` - Chat state management
- `canvas.ts` - Canvas state management
- `agent.ts` - AI agent state
- `configs.ts` - Configuration state

### Testing Strategy

#### Test Structure (`src/__tests__/`)
```
src/__tests__/
├── components/marketplace/     # Core component tests
├── diagnostics/               # Diagnostic validation tests
├── integration/              # Integration tests
└── utils/                    # Utility function tests
```

#### Key Test Files
- `UnifiedGenerationInterface.test.tsx` - Core marketplace functionality
- `ClothesChangingDiagnostic.test.ts` - FLUX Pro Kontext model testing
- `ClothesChangingTest.test.ts` - Integration testing for clothes changing
- `LivePipelineTest.test.ts` - Pipeline processing tests
- `imageUpload.test.ts` - Image upload utilities

## Environment Management System

### Environment Modes
- **Local Mode**: Uses local Supabase instance (`http://127.0.0.1:54321`)
- **Remote Mode**: Uses production Supabase instance

### Environment Files
- `.env` - Main environment configuration with automatic switching support
- `switch-env.js` - Utility script for seamless environment transitions
- Environment mode controlled by `VITE_ENV_MODE` variable

### Local Development Setup
```bash
# Full local setup
npm run env:local
npm run local:supabase
supabase functions deploy --no-verify-jwt
npm run dev
```

### Remote Development Setup
```bash
# Remote setup
npm run env:remote
npm run dev
```

## Key Features & Capabilities

### AI Model Integration
- **Batch Processing System** - Multi-model comparison with parallel generation
- **Pipeline Processing** - Multi-step AI workflows (background removal, upscaling, etc.)
- **Clothes Changing** - Using FLUX Pro Kontext model with reference images
- **Model Categories** - Text-to-Image, Image-to-Image, Image-to-Video, Video-to-Audio, etc.

### Advanced UI Features
- **Unified Generation Interface** - Single and batch mode processing
- **Dynamic Category Filtering** - Real-time model count calculation
- **Data URL Support** - Base64 image handling for API compatibility
- **Responsive Design** - Works on desktop and mobile

### Designer Integration (Jaaz System)
- **Chat Interface** - Multi-model AI chat with conversation management
- **Canvas System** - Excalidraw-based drawing and collaboration
- **Unified Workspace** - Integrated chat and canvas environment

## OAuth & Authentication

### OAuth Test Pages
- `/google-test` - Google OAuth testing interface
- `/twitter-test` - Twitter OAuth testing interface
- `/auth` - Main authentication page

### Diagnostic Scripts (`scripts/`)
Complete suite of OAuth diagnostic tools:
- `google-oauth-diagnostic.js` - Comprehensive OAuth analysis
- `live-oauth-test.js` - Real-time OAuth flow testing
- `browser-console-debug.js` - Browser debugging interface
- `verify-supabase-oauth.js` - Supabase configuration verification

## Development Notes

### Port Configuration
- **Primary**: `http://localhost:8080` (default)
- **Backup**: `http://localhost:8081`, `http://localhost:8082`
- Vite proxy forwards `/api` and `/socket.io` to `http://127.0.0.1:57988` (Jaaz backend)

### File Organization Principles
- **Feature-based organization** - Components grouped by functionality
- **Shared utilities** - Common code in `utils/`, `constants/`, `types/`
- **Service layer separation** - API calls isolated in `services/` and `integrations/`

### Model ID Format
- Use full fal-ai format throughout: `fal-ai/flux-pro/kontext`
- Model titles match full IDs for clarity and consistency
- Category-based organization with type indicators

### Important Dependencies
- **Zustand**: Downgraded to v4.5.7 for compatibility
- **Excalidraw**: v0.18.0 for canvas functionality  
- **Three.js**: v0.168.0 with React Three Fiber for 3D rendering
- **Supabase**: v2.50.0 for backend services

### Development Best Practices
- **Environment validation** - Automatic config validation in development
- **Error isolation** - Batch processing with individual error handling
- **Type safety** - Full TypeScript coverage
- **Test coverage** - Essential functionality testing with Vitest