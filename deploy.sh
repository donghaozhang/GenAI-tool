#!/bin/bash

# AI Model Marketplace - Deployment Script
# This script helps deploy the application to Vercel

echo "🚀 AI Model Marketplace Deployment Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📱 Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
echo "Note: Make sure you've set up your environment variables in Vercel dashboard"
echo "See DEPLOYMENT.md for detailed instructions"

# Ask if this is a production deployment
read -p "Is this a production deployment? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying to production..."
    vercel --prod
else
    echo "🧪 Deploying to preview..."
    vercel
fi

echo ""
echo "🎉 Deployment complete!"
echo "Don't forget to:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Deploy Edge Functions: supabase functions deploy process-image-pipeline"
echo "3. Update Supabase Auth settings with your new domain"
echo ""
echo "See DEPLOYMENT.md for complete setup instructions." 