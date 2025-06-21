# AI Model Marketplace - Deployment Script (PowerShell)
# This script helps deploy the application to Vercel

Write-Host "🚀 AI Model Marketplace Deployment Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build the project
Write-Host "🔨 Building the project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix the errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (!$vercelInstalled) {
    Write-Host "📱 Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy to Vercel
Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Cyan
Write-Host "Note: Make sure you've set up your environment variables in Vercel dashboard" -ForegroundColor Yellow
Write-Host "See DEPLOYMENT.md for detailed instructions" -ForegroundColor Yellow

# Ask if this is a production deployment
$production = Read-Host "Is this a production deployment? (y/N)"
if ($production -match "^[Yy]$") {
    Write-Host "🚀 Deploying to production..." -ForegroundColor Green
    vercel --prod
} else {
    Write-Host "🧪 Deploying to preview..." -ForegroundColor Yellow
    vercel
}

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "Don't forget to:" -ForegroundColor Yellow
Write-Host "1. Set up environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "2. Deploy Edge Functions: supabase functions deploy process-image-pipeline" -ForegroundColor White
Write-Host "3. Update Supabase Auth settings with your new domain" -ForegroundColor White
Write-Host ""
Write-Host "See DEPLOYMENT.md for complete setup instructions." -ForegroundColor Cyan