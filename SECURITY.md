# Security Configuration

This document outlines the security measures implemented in this AI Model Marketplace application.

## Environment Variables

### Overview
All sensitive information has been moved to environment variables to prevent accidental exposure in version control.

### Required Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ Yes |
| `VITE_FAL_API_BASE_URL` | FAL.ai API base URL | ❌ No (has default) |
| `VITE_ELEVENLABS_API_BASE_URL` | ElevenLabs API base URL | ❌ No (has default) |
| `VITE_OPENROUTER_API_BASE_URL` | OpenRouter API base URL | ❌ No (has default) |
| `VITE_APP_NAME` | Application name | ❌ No (has default) |
| `VITE_APP_DOMAIN` | Application domain | ❌ No (has default) |

### Setup Instructions

1. **Copy the template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file:**
   Replace placeholder values with your actual credentials.

3. **Verify setup:**
   The application will automatically validate environment variables on startup and display a console log with the status.

## Security Features

### ✅ Implemented

- **Environment Variable Validation**: Automatic validation of required variables on app startup
- **Type Safety**: TypeScript interfaces for all environment variables
- **Git Ignore**: `.env` files are excluded from version control
- **Centralized Configuration**: Single source of truth for all environment variables
- **Development Debugging**: Console logging of environment variable status in development mode
- **Secure Display**: API keys are truncated in debug logs

### 🔒 Best Practices

- **Never commit `.env` files** to version control
- **Use `.env.example`** as a template for team members
- **Rotate API keys regularly** in production
- **Use different keys** for development, staging, and production environments
- **Monitor API usage** to detect unauthorized access

## Files Modified

### Created Files
- `.env` - Local environment variables (not committed)
- `.env.example` - Environment template (safe to commit)
- `src/config/env.ts` - Centralized configuration
- `src/types/env.ts` - TypeScript types for environment variables
- `src/utils/env-check.ts` - Development debugging utility
- `SECURITY.md` - This documentation

### Modified Files
- `.gitignore` - Added environment variable exclusions
- `src/vite-env.d.ts` - Added environment variable types
- `src/integrations/supabase/client.ts` - Updated to use environment variables
- `src/App.tsx` - Added environment variable validation
- `README.md` - Added setup instructions

## Troubleshooting

### Common Issues

1. **"Missing required environment variables" error:**
   - Ensure `.env` file exists in project root
   - Verify all required variables are set
   - Check for typos in variable names

2. **Supabase connection errors:**
   - Verify `VITE_SUPABASE_URL` is correct
   - Ensure `VITE_SUPABASE_ANON_KEY` is valid
   - Check Supabase project status

3. **Environment variables not loading:**
   - Restart the development server
   - Ensure variables start with `VITE_`
   - Check for syntax errors in `.env` file

### Debug Commands

```bash
# Check environment variables in browser console
# Look for "🔍 Environment Variables Check" output

# Restart development server
npm run dev
```

## Production Deployment

When deploying to production:

1. Set environment variables in your hosting platform
2. Never use development keys in production
3. Enable additional security measures (CORS, rate limiting, etc.)
4. Monitor API usage and set up alerts
5. Regularly rotate API keys

---

**Last Updated:** January 2025
**Version:** 1.0.0 