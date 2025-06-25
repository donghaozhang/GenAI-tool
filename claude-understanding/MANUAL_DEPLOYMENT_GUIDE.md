# 🚀 Manual Deployment Guide for Jaaz Integration

## 📋 Prerequisites Check

### 1. Supabase CLI Installation
```bash
# Check if Supabase CLI is installed
which supabase

# If not installed, install it:
npm install -g supabase
# or
curl -sSfL https://supabase.com/install.sh | sh
```

### 2. Supabase Authentication
```bash
# Login to Supabase
supabase login

# Link to your project (if not already linked)
supabase link --project-ref wdprvtqbwnhwbpufcmgg
```

---

## 🚀 Step 1: Deploy Edge Functions

### Deploy Jaaz Chat Function
```bash
cd /home/zdhpe/GenAI-tool
supabase functions deploy jaaz-chat --no-verify-jwt
```

**Expected Output:**
```
✅ Functions deployed successfully
- jaaz-chat: https://wdprvtqbwnhwbpufcmgg.supabase.co/functions/v1/jaaz-chat
```

### Deploy Jaaz Canvas Function
```bash
supabase functions deploy jaaz-canvas --no-verify-jwt
```

**Expected Output:**
```
✅ Functions deployed successfully
- jaaz-canvas: https://wdprvtqbwnhwbpufcmgg.supabase.co/functions/v1/jaaz-canvas
```

### Deploy Jaaz Settings Function
```bash
supabase functions deploy jaaz-settings --no-verify-jwt
```

**Expected Output:**
```
✅ Functions deployed successfully
- jaaz-settings: https://wdprvtqbwnhwbpufcmgg.supabase.co/functions/v1/jaaz-settings
```

---

## 🗄️ Step 2: Apply Database Migration

### Run Database Migration
```bash
supabase db push
```

**Expected Output:**
```
✅ Database migrations applied successfully
- 20250125000000_create_jaaz_tables.sql applied
```

### Verify Tables Created
```bash
# Check if tables were created
supabase db status
```

**Expected Tables:**
- ✅ `chat_sessions`
- ✅ `chat_messages`
- ✅ `canvases`
- ✅ `ai_providers`
- ✅ `user_settings`
- ✅ `system_settings`

---

## 🧪 Step 3: Test Deployment

### Start Development Server
```bash
npm run dev
```

### Test Endpoints
Navigate to these URLs to test functionality:

#### 1. Chat System Test
- **URL**: `http://localhost:8080/designer`
- **Expected**: Chat interface loads, can send messages
- **Backend**: Uses `jaaz-chat` Edge Function

#### 2. Canvas System Test
- **URL**: `http://localhost:8080/canvas`
- **Expected**: Canvas list loads, can create new canvas
- **Backend**: Uses `jaaz-canvas` Edge Function

#### 3. Settings System Test
- **URL**: `http://localhost:8080/settings`
- **Expected**: Settings page loads, can view/edit settings
- **Backend**: Uses `jaaz-settings` Edge Function

#### 4. Agent Studio Test
- **URL**: `http://localhost:8080/agent-studio`
- **Expected**: Agent workflow editor loads
- **Backend**: Uses existing components

---

## 🔧 Troubleshooting

### Issue 1: Supabase CLI Not Found
```bash
# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version
```

### Issue 2: Authentication Error
```bash
# Login to Supabase
supabase login

# Check project link
supabase status
```

### Issue 3: Edge Function Deployment Fails
```bash
# Check function syntax
cd supabase/functions/jaaz-chat
deno check index.ts

# Deploy with verbose output
supabase functions deploy jaaz-chat --no-verify-jwt --debug
```

### Issue 4: Database Migration Fails
```bash
# Check migration status
supabase db status

# Reset database (CAUTION: This will delete data)
supabase db reset

# Apply migrations
supabase db push
```

### Issue 5: API Endpoint 404 Errors
**Problem**: Frontend gets 404 when calling Edge Functions

**Solution**:
1. Verify Edge Functions are deployed in Supabase dashboard
2. Check environment configuration:
   ```javascript
   // In browser console
   console.log(config.supabase.functionsUrl);
   // Should show: https://wdprvtqbwnhwbpufcmgg.supabase.co/functions/v1
   ```

### Issue 6: CORS Errors
**Problem**: CORS policy blocks requests

**Solution**: 
- Edge Functions already include CORS headers
- Check browser network tab for actual error
- Verify Edge Function deployment

---

## 📊 Deployment Verification Checklist

### ✅ Edge Functions Deployed
- [ ] `jaaz-chat` function accessible at `/functions/v1/jaaz-chat`
- [ ] `jaaz-canvas` function accessible at `/functions/v1/jaaz-canvas`
- [ ] `jaaz-settings` function accessible at `/functions/v1/jaaz-settings`

### ✅ Database Schema Applied
- [ ] All 6 tables created successfully
- [ ] RLS policies applied
- [ ] Default data inserted (3 AI providers, 3 system settings)

### ✅ Frontend Integration Working
- [ ] Chat interface loads at `/designer`
- [ ] Canvas list loads at `/canvas`
- [ ] Settings page loads at `/settings`
- [ ] No console errors in browser

### ✅ API Integration Working
- [ ] Chat API calls succeed (check Network tab)
- [ ] Canvas API calls succeed
- [ ] Settings API calls succeed

---

## 🎉 Success Indicators

### When Deployment is Successful:
1. **Edge Functions**: All 3 functions show "Deployed" status in Supabase dashboard
2. **Database**: All 6 tables visible in Supabase Table Editor
3. **Frontend**: All Jaaz pages load without errors
4. **API**: Network tab shows successful calls to Edge Functions
5. **Console**: No error messages in browser console

### Test User Journey:
1. Navigate to `/designer` → Chat interface loads
2. Send a test message → Response received (placeholder for now)
3. Navigate to `/canvas` → Canvas list loads
4. Create new canvas → Canvas created successfully
5. Navigate to `/settings` → Settings page loads

---

## 🚀 Alternative: Supabase Dashboard Deployment

If CLI deployment fails, you can deploy through the Supabase Dashboard:

### 1. Go to Supabase Dashboard
- Visit: https://supabase.com/dashboard/project/wdprvtqbwnhwbpufcmgg

### 2. Navigate to Edge Functions
- Click "Edge Functions" in left sidebar

### 3. Create Functions Manually
- Click "Create Function"
- Name: `jaaz-chat`
- Copy content from `supabase/functions/jaaz-chat/index.ts`
- Repeat for `jaaz-canvas` and `jaaz-settings`

### 4. Apply Database Migration
- Go to "SQL Editor"
- Copy content from `supabase/migrations/20250125000000_create_jaaz_tables.sql`
- Execute the SQL

---

**🎯 Ready to Deploy! Follow the steps above to complete the Jaaz integration deployment.** 