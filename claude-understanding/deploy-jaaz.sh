#!/bin/bash

echo "🚀 Starting Jaaz Integration Deployment (Phase 6)"
echo "=================================================="

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "📦 Deploying Edge Functions..."

# Deploy Jaaz Chat Function
echo "  🗨️  Deploying jaaz-chat function..."
supabase functions deploy jaaz-chat --no-verify-jwt
if [ $? -eq 0 ]; then
    echo "  ✅ jaaz-chat deployed successfully"
else
    echo "  ❌ Failed to deploy jaaz-chat"
    exit 1
fi

# Deploy Jaaz Canvas Function
echo "  🎨 Deploying jaaz-canvas function..."
supabase functions deploy jaaz-canvas --no-verify-jwt
if [ $? -eq 0 ]; then
    echo "  ✅ jaaz-canvas deployed successfully"
else
    echo "  ❌ Failed to deploy jaaz-canvas"
    exit 1
fi

# Deploy Jaaz Settings Function
echo "  ⚙️  Deploying jaaz-settings function..."
supabase functions deploy jaaz-settings --no-verify-jwt
if [ $? -eq 0 ]; then
    echo "  ✅ jaaz-settings deployed successfully"
else
    echo "  ❌ Failed to deploy jaaz-settings"
    exit 1
fi

echo ""
echo "🗄️  Running database migration..."

# Apply database migration
supabase db push
if [ $? -eq 0 ]; then
    echo "  ✅ Database migration applied successfully"
else
    echo "  ❌ Failed to apply database migration"
    exit 1
fi

echo ""
echo "🎉 Jaaz Integration Deployment Complete!"
echo "========================================"
echo ""
echo "✅ Edge Functions Deployed:"
echo "   - jaaz-chat: /functions/v1/jaaz-chat"
echo "   - jaaz-canvas: /functions/v1/jaaz-canvas"  
echo "   - jaaz-settings: /functions/v1/jaaz-settings"
echo ""
echo "✅ Database Schema Applied:"
echo "   - chat_sessions table"
echo "   - chat_messages table"
echo "   - canvases table"
echo "   - ai_providers table"
echo "   - user_settings table"
echo "   - system_settings table"
echo ""
echo "🔄 Next Steps:"
echo "   1. Test the deployed functions"
echo "   2. Start the development server: npm run dev"
echo "   3. Test chat functionality at /designer"
echo "   4. Test canvas functionality at /canvas"
echo "   5. Test settings functionality at /settings"
echo ""
echo "🚀 Ready for Phase 6 Integration Testing!" 