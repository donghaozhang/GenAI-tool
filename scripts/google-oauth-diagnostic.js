// scripts/google-oauth-diagnostic.js
// Comprehensive Google OAuth diagnostic tool to identify configuration issues

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuration
const SUPABASE_PROJECT_URL = "https://wdprvtqbwnhwbpufcmgg.supabase.co";
const PROJECT_ID = "speedy-sunspot-460603-p7";
const EXPECTED_REDIRECT_URI = "https://wdprvtqbwnhwbpufcmgg.supabase.co/auth/v1/callback";
const LOCALHOST_URLS = ["http://localhost:8080", "http://localhost:8081", "http://localhost:8082"];

console.log("🔍 Google OAuth Diagnostic Tool");
console.log("=" .repeat(50));

// Test 1: Check Supabase OAuth redirect
async function testSupabaseOAuthRedirect() {
  console.log("\n📡 Test 1: Supabase OAuth Redirect");
  console.log("-".repeat(30));
  
  try {
    const authorizeUrl = `${SUPABASE_PROJECT_URL}/auth/v1/authorize?provider=google&redirect_to=http%3A%2F%2Flocalhost%3A8081%2F`;
    
    const response = await fetch(authorizeUrl, {
      method: "GET",
      redirect: "manual"
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 302) {
      const location = response.headers.get('location');
      console.log("✅ Supabase redirects correctly");
      console.log(`Redirect URL: ${location}`);
      
      // Extract client_id from redirect URL
      const clientIdMatch = location.match(/client_id=([^&]+)/);
      if (clientIdMatch) {
        const clientId = decodeURIComponent(clientIdMatch[1]);
        console.log(`🔑 Client ID being used: ${clientId}`);
        return clientId;
      }
    } else {
      console.log("❌ Supabase not redirecting properly");
      return null;
    }
  } catch (error) {
    console.log(`❌ Error testing Supabase: ${error.message}`);
    return null;
  }
}

// Test 2: List all OAuth clients in Google Cloud
async function listGoogleOAuthClients() {
  console.log("\n🌐 Test 2: Google Cloud OAuth Clients");
  console.log("-".repeat(30));
  
  try {
    // Try to list OAuth clients using gcloud
    const { stdout } = await execAsync(`gcloud auth application-default print-access-token`);
    const accessToken = stdout.trim();
    
    console.log("✅ Got access token");
    
    // Make API call to list OAuth clients
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
    const tokenInfo = await response.json();
    
    if (tokenInfo.audience) {
      console.log(`🔑 Current token audience: ${tokenInfo.audience}`);
    }
    
    // Try to get project info
    const projectResponse = await fetch(`https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT_ID}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (projectResponse.ok) {
      console.log("✅ Can access project via API");
    } else {
      console.log("❌ Cannot access project via API");
    }
    
  } catch (error) {
    console.log(`❌ Error accessing Google Cloud: ${error.message}`);
  }
}

// Test 3: Check specific client ID configuration
async function checkClientIdConfiguration(clientId) {
  console.log("\n🔧 Test 3: Client ID Configuration Check");
  console.log("-".repeat(30));
  
  if (!clientId) {
    console.log("❌ No client ID to check");
    return;
  }
  
  console.log(`Checking client ID: ${clientId}`);
  
  // Extract project number from client ID
  const projectNumber = clientId.split('-')[0];
  console.log(`📊 Project number: ${projectNumber}`);
  
  // Check if client ID format is correct
  if (clientId.endsWith('.apps.googleusercontent.com')) {
    console.log("✅ Client ID format is correct");
  } else {
    console.log("❌ Client ID format is incorrect");
  }
}

// Test 4: Validate redirect URIs
async function validateRedirectURIs() {
  console.log("\n🔄 Test 4: Redirect URI Validation");
  console.log("-".repeat(30));
  
  console.log("Expected redirect URIs:");
  console.log(`✓ ${EXPECTED_REDIRECT_URI}`);
  LOCALHOST_URLS.forEach(url => {
    console.log(`✓ ${url}/`);
  });
  
  console.log("\nExpected JavaScript origins:");
  console.log(`✓ https://wdprvtqbwnhwbpufcmgg.supabase.co`);
  LOCALHOST_URLS.forEach(url => {
    console.log(`✓ ${url}`);
  });
}

// Test 5: Check OAuth consent screen status
async function checkOAuthConsentScreen() {
  console.log("\n📋 Test 5: OAuth Consent Screen Status");
  console.log("-".repeat(30));
  
  try {
    const { stdout } = await execAsync(`gcloud auth application-default print-access-token`);
    const accessToken = stdout.trim();
    
    // Check if we can access the OAuth brand
    console.log("Checking OAuth consent screen configuration...");
    console.log("Manual check required at:");
    console.log(`https://console.cloud.google.com/apis/credentials/consent?project=${PROJECT_ID}`);
    
  } catch (error) {
    console.log(`❌ Error checking consent screen: ${error.message}`);
  }
}

// Test 6: Test actual OAuth flow
async function testOAuthFlow(clientId) {
  console.log("\n🧪 Test 6: OAuth Flow Test");
  console.log("-".repeat(30));
  
  if (!clientId) {
    console.log("❌ No client ID to test");
    return;
  }
  
  // Construct the Google OAuth URL manually
  const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(EXPECTED_REDIRECT_URI)}&response_type=code&scope=email+profile`;
  
  console.log("🔗 Manual test URL:");
  console.log(googleOAuthUrl);
  
  try {
    const response = await fetch(googleOAuthUrl, {
      method: "HEAD",
      redirect: "manual"
    });
    
    console.log(`Google OAuth endpoint status: ${response.status}`);
    
    if (response.status === 200) {
      console.log("✅ Google OAuth endpoint is accessible");
    } else if (response.status === 302) {
      console.log("✅ Google OAuth endpoint redirects (normal behavior)");
    } else {
      console.log("❌ Google OAuth endpoint returned unexpected status");
    }
    
  } catch (error) {
    console.log(`❌ Error testing OAuth flow: ${error.message}`);
  }
}

// Main diagnostic function
async function runDiagnostics() {
  console.log(`🎯 Target project: ${PROJECT_ID}`);
  console.log(`🎯 Supabase URL: ${SUPABASE_PROJECT_URL}`);
  
  const clientId = await testSupabaseOAuthRedirect();
  await listGoogleOAuthClients();
  await checkClientIdConfiguration(clientId);
  await validateRedirectURIs();
  await checkOAuthConsentScreen();
  await testOAuthFlow(clientId);
  
  console.log("\n📝 Summary & Next Steps");
  console.log("=" .repeat(50));
  console.log("1. Check if the client ID from Supabase matches your Google Cloud Console");
  console.log("2. Verify all redirect URIs are configured in Google Cloud Console");
  console.log("3. Ensure OAuth consent screen is published");
  console.log("4. Test the manual OAuth URL above in a browser");
  console.log("\n🔧 If issues persist, update Supabase with the correct client ID from:");
  console.log(`   https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}`);
}

// Run diagnostics
runDiagnostics().catch(console.error); 