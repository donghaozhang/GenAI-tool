#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

// Read current .env file
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
  process.exit(1);
}

// Get command line argument
const targetMode = process.argv[2];

if (!targetMode || !['local', 'remote'].includes(targetMode)) {
  console.log('Usage: node switch-env.js [local|remote]');
  console.log('');
  console.log('Examples:');
  console.log('  node switch-env.js local   # Switch to local development');
  console.log('  node switch-env.js remote  # Switch to remote/production');
  process.exit(1);
}

// Update VITE_ENV_MODE
const updatedContent = envContent.replace(
  /VITE_ENV_MODE=.*/,
  `VITE_ENV_MODE=${targetMode}`
);

// Update active configuration based on target mode
let finalContent;
if (targetMode === 'local') {
  finalContent = updatedContent
    .replace(/VITE_SUPABASE_URL=.*/, 'VITE_SUPABASE_URL=http://127.0.0.1:54321')
    .replace(/VITE_SUPABASE_ANON_KEY=.*/, 'VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');
} else {
  finalContent = updatedContent
    .replace(/VITE_SUPABASE_URL=.*/, 'VITE_SUPABASE_URL=https://wdprvtqbwnhwbpufcmgg.supabase.co')
    .replace(/VITE_SUPABASE_ANON_KEY=.*/, 'VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkcHJ2dHFid25od2JwdWZjbWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDQyODksImV4cCI6MjA2NTUyMDI4OX0.6_f-ggUyf57kq1onDb_eXXPZSyctVpi7bglTxK_V0fE');
}

// Write updated .env file
try {
  fs.writeFileSync(envPath, finalContent);
  console.log(`✅ Successfully switched to ${targetMode.toUpperCase()} environment`);
  
  if (targetMode === 'local') {
    console.log('🏠 Using local Supabase instance (http://127.0.0.1:54321)');
    console.log('💡 Make sure to run "supabase start" first');
    console.log('⚠️  Note: OAuth providers need manual configuration for local development');
  } else {
    console.log('🌐 Using remote Supabase instance');
    console.log('💡 Make sure your FAL API key is set for pipeline processing');
    console.log('✅ OAuth authentication (Google) will work automatically');
  }
  
  console.log('🔄 Restart your development server to apply changes');
} catch (error) {
  console.error('❌ Error writing .env file:', error.message);
  process.exit(1);
} 