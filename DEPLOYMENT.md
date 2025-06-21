# Deployment Guide - Vercel & Supabase

This guide will help you deploy the AI Model Marketplace to Vercel with Supabase backend.

## 🚀 Quick Setup

### Prerequisites
- GitHub account
- Vercel account (free tier is fine)
- Supabase account
- FAL API key

### 1. Fork & Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/GenAI-tool.git
cd GenAI-tool
npm install
```

### 2. Local Development Setup

#### Install Supabase CLI
```bash
npm install -g supabase
```

#### Start local Supabase
```bash
supabase start
```

#### Configure local environment
1. Copy `.env.local.example` to `.env.local`
2. Add your FAL API key to `.env.local`:
   ```
   VITE_FAL_API_KEY=your_actual_fal_api_key_here
   ```

#### Run locally
```bash
npm run dev
```

Your app will be available at `http://localhost:5173`

### 3. Deploy to Vercel

#### Option A: Automatic (Recommended)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

2. **Set Environment Variables in Vercel**
   Go to Project Settings → Environment Variables and add:
   
   ```
   VITE_SUPABASE_URL = https://wdprvtqbwnhwbpufcmgg.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkcHJ2dHFid25od2JwdWZjbWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDQyODksImV4cCI6MjA2NTUyMDI4OX0.6_f-ggUyf57kq1onDb_eXXPZSyctVpi7bglTxK_V0fE
   VITE_SUPABASE_FUNCTIONS_URL = https://wdprvtqbwnhwbpufcmgg.supabase.co/functions/v1
   VITE_FAL_API_KEY = your_fal_api_key_here
   VITE_FAL_API_BASE_URL = https://fal.run
   VITE_ELEVENLABS_API_BASE_URL = https://api.elevenlabs.io
   VITE_OPENROUTER_API_BASE_URL = https://openrouter.ai
   VITE_APP_NAME = AI Model Marketplace
   VITE_APP_DOMAIN = your-project-name.vercel.app
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app
   - You'll get a URL like `https://your-project-name.vercel.app`

#### Option B: Command Line

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### 4. Configure Supabase for Production

#### Update Auth Settings
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (`wdprvtqbwnhwbpufcmgg`)
3. Go to Authentication → URL Configuration
4. Set:
   - **Site URL**: `https://your-project-name.vercel.app`
   - **Additional Redirect URLs**: 
     ```
     https://your-project-name.vercel.app/*
     http://localhost:5173/*
     http://localhost:3000/*
     ```

#### Update CORS Settings
1. Go to API → Settings
2. Add to **CORS Origins**:
   ```
   https://your-project-name.vercel.app
   http://localhost:5173
   ```

#### Deploy Edge Functions
```bash
# Link to your Supabase project
supabase link --project-ref wdprvtqbwnhwbpufcmgg

# Deploy the edge function
supabase functions deploy process-image-pipeline

# Set the FAL API key for the edge function
supabase secrets set FAL_API_KEY="your_fal_api_key_here"
```

### 5. GitHub Actions (Optional but Recommended)

For automatic deployments, add these secrets to your GitHub repository:

1. Go to GitHub repository → Settings → Secrets and Variables → Actions
2. Add these secrets:
   ```
   VERCEL_TOKEN = (get from vercel.com/account/tokens)
   VERCEL_ORG_ID = (get from vercel.json after first deploy)
   VERCEL_PROJECT_ID = (get from vercel.json after first deploy)
   SUPABASE_ACCESS_TOKEN = (get from supabase.com/dashboard/account/tokens)
   FAL_API_KEY = your_fal_api_key_here
   ```

Now every push to `main` will automatically deploy!

## 🔧 Development Workflow

### Local Development
```bash
# Start Supabase services
supabase start

# In another terminal, start the frontend
npm run dev

# Your app runs on http://localhost:5173
# Supabase Studio on http://localhost:54323
```

### Making Changes
1. Make your changes locally
2. Test with `npm run test`
3. Commit and push to GitHub
4. Vercel automatically deploys (if GitHub Actions is set up)

### Edge Function Development
```bash
# Make changes to supabase/functions/process-image-pipeline/index.ts
# Deploy to production
supabase functions deploy process-image-pipeline
```

## 🌍 Environment Differences

| Environment | Supabase URL | Functions URL | Description |
|-------------|--------------|---------------|-------------|
| **Local** | `http://localhost:54321` | `http://localhost:54321/functions/v1` | Uses local Supabase containers |
| **Production** | `https://wdprvtqbwnhwbpufcmgg.supabase.co` | `https://wdprvtqbwnhwbpufcmgg.supabase.co/functions/v1` | Uses hosted Supabase |

The same code works in both environments thanks to environment variables!

## 🚨 Troubleshooting

### Build Errors
- Make sure all environment variables are set in Vercel
- Check the build logs in Vercel dashboard

### API Errors
- Verify FAL API key is set correctly
- Check Supabase Edge Function logs in dashboard
- Ensure CORS settings include your domain

### Auth Issues
- Check Supabase Auth settings
- Verify redirect URLs are correct
- Make sure site URL matches your domain

### Local Development Issues
```bash
# Reset local Supabase
supabase stop
supabase start

# Check if services are running
supabase status
```

## 📝 Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Domains" tab
3. Add your custom domain
4. Update DNS records as instructed
5. Update `VITE_APP_DOMAIN` environment variable
6. Update Supabase Auth URLs

## 🎉 You're Live!

Your AI Model Marketplace is now deployed and accessible worldwide! 

- **Frontend**: `https://your-project-name.vercel.app`
- **API**: Powered by Supabase Edge Functions
- **Database**: Supabase Postgres
- **Authentication**: Supabase Auth

Share your deployed app and start generating amazing AI content! 🚀 