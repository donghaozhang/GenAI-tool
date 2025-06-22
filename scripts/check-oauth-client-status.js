// scripts/check-oauth-client-status.js
// Check OAuth client status in Google Cloud Console

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log("🔍 Checking OAuth Client Status");
console.log("=" .repeat(40));

const PROJECT_ID = "speedy-sunspot-460603-p7";
const CLIENT_ID = "389790994997-qcla9r90kd25v9j46n6qj9je54o2dn6q9ge5g4c2dn2.apps.googleusercontent.com";

async function checkOAuthClientStatus() {
  try {
    console.log(`📊 Project: ${PROJECT_ID}`);
    console.log(`🔑 Client ID: ${CLIENT_ID}`);
    
    // Check if we can list OAuth clients
    console.log("\n🔍 Attempting to list OAuth clients...");
    
    try {
      // Try to get project info first
      const { stdout: projectInfo } = await execAsync(`gcloud projects describe ${PROJECT_ID}`);
      console.log("✅ Project is accessible");
      
      // Check if APIs are enabled
      const { stdout: enabledApis } = await execAsync(`gcloud services list --enabled --project=${PROJECT_ID} --format="value(name)" --filter="name:oauth2.googleapis.com OR name:iamcredentials.googleapis.com"`);
      
      if (enabledApis.includes('oauth2.googleapis.com')) {
        console.log("✅ OAuth2 API is enabled");
      } else {
        console.log("❌ OAuth2 API may not be enabled");
      }
      
      // Try to check the OAuth client directly
      console.log("\n🔧 Manual checks required:");
      console.log("1. Go to Google Cloud Console:");
      console.log(`   https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}`);
      console.log("\n2. Find your OAuth 2.0 Client:");
      console.log(`   Look for: ${CLIENT_ID}`);
      console.log("\n3. Check these items:");
      console.log("   ✓ Client is ENABLED (not disabled)");
      console.log("   ✓ Client Secret matches Supabase Dashboard");
      console.log("   ✓ Authorized redirect URIs include:");
      console.log("     - https://wdprvtqbwnhwbpufcmgg.supabase.co/auth/v1/callback");
      console.log("   ✓ Authorized JavaScript origins include:");
      console.log("     - https://wdprvtqbwnhwbpufcmgg.supabase.co");
      
    } catch (error) {
      console.log(`❌ Error accessing project: ${error.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Also check current gcloud configuration
async function checkGcloudConfig() {
  console.log("\n⚙️ Current gcloud configuration:");
  
  try {
    const { stdout: currentProject } = await execAsync('gcloud config get-value project');
    console.log(`Current project: ${currentProject.trim()}`);
    
    const { stdout: currentAccount } = await execAsync('gcloud config get-value account');
    console.log(`Current account: ${currentAccount.trim()}`);
    
    if (currentProject.trim() !== PROJECT_ID) {
      console.log(`⚠️ Warning: Current project (${currentProject.trim()}) doesn't match target project (${PROJECT_ID})`);
      console.log(`Run: gcloud config set project ${PROJECT_ID}`);
    }
    
  } catch (error) {
    console.log(`❌ Error checking gcloud config: ${error.message}`);
  }
}

// Main execution
async function main() {
  await checkGcloudConfig();
  await checkOAuthClientStatus();
  
  console.log("\n🎯 NEXT STEPS:");
  console.log("1. Manually verify OAuth client in Google Cloud Console");
  console.log("2. If client is disabled, enable it");
  console.log("3. If Client Secret is different, update Supabase Dashboard");
  console.log("4. Ensure all redirect URIs are exactly configured");
  console.log("5. Try OAuth again after making changes");
}

main().catch(console.error); 