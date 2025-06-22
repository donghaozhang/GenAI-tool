// scripts/check-oauth-config.js
// Simple configuration checker for Google OAuth setup

import fs from 'fs';
import path from 'path';

console.log("🔍 OAuth Configuration Checker");
console.log("=" .repeat(40));

// Check .env file
function checkEnvFile() {
  console.log("\n📁 Checking .env file...");
  
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      console.log("❌ .env file not found");
      return;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    // Check for Google OAuth variables
    const googleClientId = lines.find(line => line.startsWith('VITE_GOOGLE_CLIENT_ID='));
    const googleClientSecret = lines.find(line => line.startsWith('VITE_GOOGLE_CLIENT_SECRET='));
    
    if (googleClientId) {
      const clientId = googleClientId.split('=')[1];
      console.log(`✅ Google Client ID found: ${clientId}`);
      
      // Validate client ID format
      if (clientId && clientId.includes('.apps.googleusercontent.com')) {
        console.log("✅ Client ID format looks correct");
      } else {
        console.log("❌ Client ID format may be incorrect");
      }
    } else {
      console.log("❌ VITE_GOOGLE_CLIENT_ID not found in .env");
    }
    
    if (googleClientSecret) {
      const secret = googleClientSecret.split('=')[1];
      console.log(`✅ Google Client Secret found: ${secret ? secret.substring(0, 10) + '...' : 'EMPTY'}`);
    } else {
      console.log("❌ VITE_GOOGLE_CLIENT_SECRET not found in .env");
    }
    
  } catch (error) {
    console.log(`❌ Error reading .env file: ${error.message}`);
  }
}

// Check Supabase configuration
function checkSupabaseConfig() {
  console.log("\n🗄️ Checking Supabase configuration...");
  
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    const supabaseUrl = lines.find(line => line.startsWith('VITE_SUPABASE_URL='));
    const supabaseKey = lines.find(line => line.startsWith('VITE_SUPABASE_ANON_KEY='));
    
    if (supabaseUrl) {
      const url = supabaseUrl.split('=')[1];
      console.log(`✅ Supabase URL: ${url}`);
      
      if (url && url.includes('wdprvtqbwnhwbpufcmgg.supabase.co')) {
        console.log("✅ Supabase URL matches expected project");
      } else {
        console.log("⚠️ Supabase URL doesn't match expected project");
      }
    } else {
      console.log("❌ VITE_SUPABASE_URL not found");
    }
    
    if (supabaseKey) {
      console.log(`✅ Supabase anon key found`);
    } else {
      console.log("❌ VITE_SUPABASE_ANON_KEY not found");
    }
    
  } catch (error) {
    console.log(`❌ Error checking Supabase config: ${error.message}`);
  }
}

// Check if Google Cloud CLI is available
async function checkGoogleCloudCLI() {
  console.log("\n☁️ Checking Google Cloud CLI...");
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const { stdout } = await execAsync('gcloud --version');
    console.log("✅ Google Cloud CLI is installed");
    console.log(stdout.split('\n')[0]); // First line with version
    
    // Check if authenticated
    try {
      const { stdout: authStdout } = await execAsync('gcloud auth list --filter=status:ACTIVE --format="value(account)"');
      if (authStdout.trim()) {
        console.log(`✅ Authenticated as: ${authStdout.trim()}`);
      } else {
        console.log("❌ Not authenticated with Google Cloud");
      }
    } catch (authError) {
      console.log("❌ Error checking authentication");
    }
    
    // Check current project
    try {
      const { stdout: projectStdout } = await execAsync('gcloud config get-value project');
      const currentProject = projectStdout.trim();
      console.log(`📊 Current project: ${currentProject}`);
      
      if (currentProject === 'speedy-sunspot-460603-p7') {
        console.log("✅ Correct project is set");
      } else {
        console.log("⚠️ Different project is set");
      }
    } catch (projectError) {
      console.log("❌ Error checking current project");
    }
    
  } catch (error) {
    console.log("❌ Google Cloud CLI not found or not accessible");
  }
}

// Main function
async function runChecks() {
  checkEnvFile();
  checkSupabaseConfig();
  await checkGoogleCloudCLI();
  
  console.log("\n🎯 Quick Fix Suggestions:");
  console.log("-".repeat(30));
  console.log("1. If Client ID is wrong, update it in Supabase Dashboard");
  console.log("2. If not authenticated, run: gcloud auth login");
  console.log("3. If wrong project, run: gcloud config set project speedy-sunspot-460603-p7");
  console.log("4. Check Google Cloud Console for correct OAuth client configuration");
}

runChecks().catch(console.error); 