# Development Setup Guide

## Prerequisites

### Required Software
- **Node.js**: v18 or higher
- **npm**: v8 or higher (or yarn/pnpm)
- **Git**: Latest version
- **Python**: 3.8+ (for Jaaz backend)
- **Browser**: Chrome/Firefox/Safari for testing

### Optional Tools
- **VS Code**: Recommended IDE with extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Auto Rename Tag
  - Prettier - Code formatter

## Environment Configuration

### 1. Clone Repository
```bash
git clone https://github.com/donghaozhang/GenAI-tool.git
cd GenAI-tool
```

### 2. Environment Variables Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
nano .env  # or use your preferred editor
```

### Required Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Provider API Keys
VITE_OPENAI_API_KEY=your_openai_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_FAL_KEY=your_fal_ai_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key

# Stripe Payment (Optional)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Jaaz Configuration (✅ Updated Integration)
VITE_JAAZ_BACKEND_URL=http://localhost:8000

# OAuth Configuration (Optional)
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_TWITTER_CLIENT_ID=your_twitter_oauth_client_id
```

### 3. Install Dependencies
```bash
# Install main project dependencies (✅ Includes new Jaaz packages)
npm install

# New packages installed for Jaaz integration:
# - @xyflow/react (Agent Studio workflow editor)
# - lodash.debounce (Performance optimizations)  
# - file-saver (Canvas export functionality)
# - jszip (Multi-file export support)

# Install Jaaz backend dependencies (if running original backend)
cd jaaz-source
npm install
cd ..
```

## Development Workflow

### Starting Development Environment

#### Option 1: Full Stack Development (✅ Updated Configuration)
```bash
# Terminal 1: Start main frontend (now includes full Jaaz integration)
npm run dev
# ✅ Runs on http://localhost:8081 with complete Jaaz UI

# Terminal 2: Start original Jaaz backend (for full functionality)
cd jaaz-source/server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
# ✅ Runs on http://localhost:8000 (updated port)

# Terminal 3: Start Supabase local (optional)
npm run local:supabase
```

#### Option 2: Frontend Only
```bash
# Use remote Supabase and external APIs
npm run dev:remote
```

### Available Scripts

#### Main Project Scripts
```bash
# Development
npm run dev                    # Start Vite dev server
npm run dev:local             # Use local Supabase
npm run dev:remote            # Use remote Supabase

# Building
npm run build                 # Production build
npm run build:dev            # Development build
npm run preview              # Preview production build

# Testing
npm run test                 # Run tests
npm run test:ui              # Run tests with UI
npm run test:run             # Run tests once
npm run test:coverage        # Run tests with coverage

# Environment switching
npm run env:local            # Switch to local environment
npm run env:remote           # Switch to remote environment

# Deployment
npm run deploy:vercel        # Deploy to Vercel
npm run deploy:vercel:prod   # Deploy to Vercel production

# Linting
npm run lint                 # Run ESLint
```

#### Jaaz Backend Scripts (in jaaz-source/)
```bash
cd jaaz-source

# Python server
python server/main.py        # Start FastAPI server
pip install -r server/requirements.txt  # Install Python deps

# React frontend (standalone)
cd react
npm run dev                  # Standalone Jaaz frontend
npm run build               # Build Jaaz frontend
```

## ✅ Current Integration Status & Testing

### Available Routes (Ready for Testing)
```bash
# Main application routes
http://localhost:8081/                    # AI Marketplace & Games
http://localhost:8081/designer            # ✅ AI Designer (Jaaz integrated)
http://localhost:8081/canvas             # ✅ Canvas Management (Jaaz)
http://localhost:8081/canvas/:canvasId   # ✅ Individual Canvas (Jaaz)
http://localhost:8081/agent-studio       # ✅ Agent Studio (Jaaz)
http://localhost:8081/settings           # ✅ Settings (Jaaz)

# Existing marketplace routes
http://localhost:8081/marketplace        # AI Model Marketplace
http://localhost:8081/auth              # Authentication
http://localhost:8081/pricing           # Pricing Plans
```

### Integration Status
- ✅ **Build**: All 5,237+ modules compile successfully
- ✅ **Components**: Complete Jaaz UI integration
- ✅ **Routing**: All major routes functional
- ✅ **Dependencies**: All packages installed (@xyflow/react, file-saver, etc.)
- ✅ **Backend Config**: Connected to original Jaaz backend (port 8000)
- ✅ **Error Resolution**: LOGO_URL, NotificationPanel, LanguageSwitcher fixed
- ⏳ **Testing**: Ready for comprehensive functionality testing

### Testing Checklist
- [ ] Chat interface with AI models
- [ ] Canvas drawing and export functionality
- [ ] Agent Studio workflow creation
- [ ] Settings configuration
- [ ] WebSocket connection to backend
- [ ] Image generation and canvas integration

## Database Setup

### Supabase Local Development
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Start local Supabase
npm run local:supabase

# Apply migrations
supabase db push

# View local dashboard
# Open http://localhost:54323
```

### Supabase Remote Setup
1. Create project at [supabase.com](https://supabase.com)
2. Get project URL and anon key
3. Update environment variables
4. Apply migrations via dashboard or CLI

## API Configuration

### Supabase Edge Functions
```bash
# Deploy functions
supabase functions deploy process-image-pipeline
supabase functions deploy create-payment-intent
supabase functions deploy consume-credits

# Local function development
supabase functions serve
```

### External API Setup

#### FAL.ai Configuration
1. Register at [fal.ai](https://fal.ai)
2. Get API key from dashboard
3. Add to `VITE_FAL_KEY` environment variable

#### OpenAI Configuration
1. Get API key from [OpenAI Platform](https://platform.openai.com)
2. Add to `VITE_OPENAI_API_KEY`
3. Configure billing if needed

#### Anthropic Configuration
1. Get API key from [Anthropic Console](https://console.anthropic.com)
2. Add to `VITE_ANTHROPIC_API_KEY`
3. Set up usage limits

## Testing Setup

### Unit Testing with Vitest
```bash
# Run tests
npm run test

# Run specific test file
npm run test -- path/to/test.test.ts

# Run tests in watch mode
npm run test -- --watch

# Generate coverage report
npm run test:coverage
```

### Integration Testing
```bash
# OAuth testing
npm run test:twitter
node scripts/test-google-oauth.js

# Live API testing
node scripts/live-oauth-test.js
node scripts/test-live-oauth.js
```

### E2E Testing (Optional)
```bash
# Install Playwright
npm install @playwright/test

# Run E2E tests
npx playwright test

# Open test UI
npx playwright test --ui
```

## Development Tools

### VS Code Configuration
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Browser Extensions
- **React Developer Tools**: Debug React components
- **Redux DevTools**: Debug state management
- **Tailwind CSS DevTools**: Debug styling

## Debugging

### Frontend Debugging
```typescript
// Enable React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Add to App.tsx in development
{process.env.NODE_ENV === 'development' && (
  <ReactQueryDevtools initialIsOpen={false} />
)}
```

### Backend Debugging (FastAPI)
```python
# Enable debug mode
# In jaaz-source/server/main.py
import uvicorn
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=57988, reload=True, debug=True)
```

### Network Debugging
```bash
# Use browser console debug scripts
node scripts/browser-console-debug.js
node scripts/quick-console-test.js
```

## Common Development Issues

### Port Conflicts
```bash
# Check port usage
lsof -i :8080  # Frontend port
lsof -i :57988 # Backend port

# Kill processes if needed
kill -9 <PID>
```

### Environment Variable Issues
```bash
# Verify environment variables are loaded
node -e "console.log(process.env.VITE_SUPABASE_URL)"

# Switch environments
npm run env:local   # Use local config
npm run env:remote  # Use remote config
```

### Dependency Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Build Issues
```bash
# Type checking
npx tsc --noEmit

# Clear build cache
rm -rf dist/
npm run build
```

## Production Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npm run deploy:vercel

# Production deployment
npm run deploy:vercel:prod
```

### Environment Variables in Production
Set the following in your deployment platform:
- All `VITE_*` variables for frontend
- Stripe keys for payment processing
- API keys for external services

### Build Optimization
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/

# Optimize for production
npm run build -- --mode production
```

This development setup provides a comprehensive environment for building and maintaining the AI marketplace with Jaaz integration, supporting both local development and production deployment scenarios.