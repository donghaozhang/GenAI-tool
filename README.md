# GenAI-tool - AI Model Marketplace

A comprehensive platform for discovering and using cutting-edge AI models with advanced pipeline capabilities.

## 🚀 Project Overview

GenAI-tool is a modern web application that provides a marketplace for AI models, featuring:
- **AI Model Discovery**: Browse and explore various AI models
- **Image Generation**: Create images using state-of-the-art AI models
- **Pipeline Processing**: Advanced AI processing workflows
- **User Authentication**: Secure user management with Supabase
- **Real-time Processing**: Dynamic AI model execution

**Repository**: https://github.com/donghaozhang/GenAI-tool

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

```bash
# Step 1: Clone the repository
git clone https://github.com/donghaozhang/GenAI-tool.git

# Step 2: Navigate to the project directory
cd GenAI-tool

# Step 3: Set up environment variables.
cp .env.example .env
# Edit .env file with your actual credentials

# Step 4: Install the necessary dependencies.
npm i

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## 🎯 Features

### Core Functionality
- **AI Model Marketplace**: Browse and discover various AI models
- **Image Generation**: Generate images using FLUX, DALL-E, and other models
- **Video Processing**: Create videos from images using Kling Video
- **3D Model Generation**: Generate 3D models with Hunyuan3D
- **Audio Generation**: Create audio using ElevenLabs
- **Background Removal**: Remove backgrounds from images
- **Upscaling**: Enhance image quality with Aura SR

### Technical Features
- **Secure Authentication**: User management with Supabase
- **Environment Variables**: Secure configuration management
- **TypeScript**: Full type safety
- **Modern UI**: Built with shadcn/ui and Tailwind CSS
- **Responsive Design**: Works on desktop and mobile
- **Real-time Processing**: Dynamic AI model execution

## Environment Setup

This project requires environment variables to be configured. Follow these steps:

1. **Copy the environment template:**
   ```sh
   cp .env.example .env
   ```

2. **Edit the `.env` file with your credentials:**
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - Other API endpoints are pre-configured but can be customized

3. **Important Security Notes:**
   - Never commit `.env` files to version control
   - The `.env` file is already included in `.gitignore`
   - Use `.env.example` as a template for other developers

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend & Authentication)

## 🚀 Deployment

### Vercel (Recommended)
1. Fork this repository
2. Connect your GitHub account to Vercel
3. Import the project
4. Set up environment variables in Vercel dashboard
5. Deploy

### Other Platforms
- **Netlify**: Connect GitHub repo and set environment variables
- **Railway**: Deploy directly from GitHub
- **Render**: Connect repository and configure environment

## 📝 API Documentation

The project includes several Supabase Edge Functions:
- `/functions/process-image-pipeline` - Main AI processing pipeline
- `/functions/generate-pokemon-images` - Pokemon image generation
- `/functions/process-elevenlabs-video` - Audio processing
- `/functions/chat-with-gpt` - Chat completions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for backend services
- [FAL.ai](https://fal.ai) for AI model APIs
- [ElevenLabs](https://elevenlabs.io) for audio generation
- [shadcn/ui](https://ui.shadcn.com) for UI components

<!-- Trigger redeployment after fixing Supabase access token -->
