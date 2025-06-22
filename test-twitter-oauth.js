#!/usr/bin/env node

// Twitter OAuth Configuration Test Script
// This script checks if all required environment variables are set
// and provides debugging information for Twitter OAuth issues

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🐦 Twitter OAuth Configuration Test');
console.log('=====================================\n');

// Read .env file
const envPath = path.join(__dirname, '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
    console.log('✅ .env file found');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Parse .env file
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                envVars[key] = valueParts.join('=');
            }
        }
    });
} else {
    console.log('❌ .env file not found');
    process.exit(1);
}

console.log('\n📋 Environment Variables Check:');
console.log('================================');

const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_TWITTER_CLIENT_ID',
    'VITE_TWITTER_CLIENT_SECRET'
];

let allSet = true;

requiredVars.forEach(varName => {
    const value = envVars[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value ? (value.length > 50 ? value.substring(0, 47) + '...' : value) : 'NOT SET';
    
    console.log(`${status} ${varName}: ${displayValue}`);
    
    if (!value) {
        allSet = false;
    }
});

console.log('\n🔧 Configuration Analysis:');
console.log('===========================');

if (allSet) {
    console.log('✅ All required environment variables are set');
} else {
    console.log('❌ Some required environment variables are missing');
}

// Check environment mode
const envMode = envVars['VITE_ENV_MODE'];
console.log(`📍 Environment Mode: ${envMode || 'NOT SET'}`);

if (envMode === 'local') {
    console.log('🏠 Using LOCAL Supabase configuration');
    console.log(`   URL: ${envVars['VITE_SUPABASE_LOCAL_URL'] || 'NOT SET'}`);
} else if (envMode === 'remote') {
    console.log('☁️ Using REMOTE Supabase configuration');
    console.log(`   URL: ${envVars['VITE_SUPABASE_REMOTE_URL'] || 'NOT SET'}`);
} else {
    console.log('⚠️ Environment mode not properly set');
}

// Twitter credentials analysis
console.log('\n🐦 Twitter OAuth Credentials:');
console.log('==============================');

const twitterClientId = envVars['VITE_TWITTER_CLIENT_ID'];
const twitterClientSecret = envVars['VITE_TWITTER_CLIENT_SECRET'];

if (twitterClientId && twitterClientSecret) {
    console.log('✅ Twitter OAuth 2.0 credentials are configured');
    console.log(`📱 Client ID: ${twitterClientId}`);
    console.log(`🔐 Client Secret: ${twitterClientSecret.substring(0, 10)}...`);
    
    // Check if these look like OAuth 2.0 credentials
    if (twitterClientId.includes(':') && twitterClientId.length > 20) {
        console.log('✅ Client ID format looks correct for OAuth 2.0');
    } else {
        console.log('⚠️ Client ID format might be incorrect for OAuth 2.0');
        console.log('   OAuth 2.0 Client IDs typically contain colons and are longer');
    }
    
    if (twitterClientSecret.length > 40) {
        console.log('✅ Client Secret length looks correct for OAuth 2.0');
    } else {
        console.log('⚠️ Client Secret might be too short for OAuth 2.0');
        console.log('   OAuth 2.0 Client Secrets are typically longer than OAuth 1.0a');
    }
} else {
    console.log('❌ Twitter OAuth credentials are missing');
}

console.log('\n🔍 Next Steps:');
console.log('===============');

if (!allSet) {
    console.log('1. ❌ Set missing environment variables in .env file');
}

console.log('2. 🌐 Navigate to: http://localhost:8082/twitter-test');
console.log('3. 🧪 Run the browser-based test suite');
console.log('4. 🐦 Try the Twitter OAuth test button');
console.log('5. 📊 Check Supabase dashboard: Auth → Providers → Twitter');

console.log('\n🔧 Supabase Dashboard Checklist:');
console.log('=================================');
console.log('□ Twitter provider is enabled');
console.log('□ OAuth 2.0 credentials are entered (not OAuth 1.0a)');
console.log('□ Redirect URLs include:');
console.log('  - https://wdprvtqbwnhwbpufcmgg.supabase.co/auth/v1/callback');
console.log('  - http://localhost:8082/twitter-test');
console.log('  - http://localhost:8081/twitter-test');
console.log('  - http://localhost:8080/twitter-test');

console.log('\n🐛 Common Issues:');
console.log('==================');
console.log('• Using OAuth 1.0a credentials instead of OAuth 2.0');
console.log('• Redirect URLs not matching between Twitter app and Supabase');
console.log('• Twitter provider not enabled in Supabase dashboard');
console.log('• Environment variables not properly set');
console.log('• Twitter app permissions not set correctly');

console.log('\n✅ Test complete! Check the results above.\n');

// Exit with appropriate code
process.exit(allSet ? 0 : 1); 