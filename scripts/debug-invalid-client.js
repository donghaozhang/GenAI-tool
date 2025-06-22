// scripts/debug-invalid-client.js
// Debug the invalid_client error

console.log("🚨 Debugging Invalid Client Error");
console.log("=" .repeat(50));

// Extract client ID from the error URL you showed
const errorUrl = "accounts.google.com/signin/oauth/error/v2?authError=Cg5pbnZhbGlkX2NsaWVudBITUmVkaXJlY3QgVVJJIG1pc21hdGNoGgJlbg%3D%3D&client_id=389790994997-qcla9r90kd25v9j46n6qj9je54o2dn6q9ge5g4c2dn2.apps.googleusercontent.com";

console.log("\n🔍 ERROR ANALYSIS:");
console.log("- Error: invalid_client");
console.log("- This means Google doesn't recognize the Client ID or there's a configuration mismatch");

// Check what we know about the configuration
console.log("\n📊 CONFIGURATION COMPARISON:");
console.log("Client ID from error URL:");
console.log("389790994997-qcla9r90kd25v9j46n6qj9je54o2dn6q9ge5g4c2dn2.apps.googleusercontent.com");
console.log("\nClient ID from Supabase Dashboard:");
console.log("389790994997-qcla9r90kd25v9j46n6qj9je54o2dn6q9ge5g4c2dn2.apps.googleusercontent.com");
console.log("\n✅ Client IDs MATCH - so the issue is elsewhere");

console.log("\n❌ POSSIBLE CAUSES:");
console.log("1. Client Secret mismatch in Supabase Dashboard");
console.log("2. OAuth client is disabled in Google Cloud Console");
console.log("3. Redirect URI mismatch");
console.log("4. OAuth consent screen issues");
console.log("5. Project configuration problems");

console.log("\n🔧 IMMEDIATE FIXES TO TRY:");
console.log("1. Check if the OAuth client is ENABLED in Google Cloud Console");
console.log("2. Verify the Client Secret in Supabase matches Google Cloud Console");
console.log("3. Check redirect URIs are exactly configured");
console.log("4. Ensure OAuth consent screen is still published");

console.log("\n🌐 GOOGLE CLOUD CONSOLE CHECKS:");
console.log("Go to: https://console.cloud.google.com/apis/credentials?project=speedy-sunspot-460603-p7");
console.log("1. Find your OAuth client: 389790994997-qcla9r90kd25v9j46n6qj9je54o2dn6q9ge5g4c2dn2");
console.log("2. Verify it's ENABLED (not disabled)");
console.log("3. Check the Client Secret");
console.log("4. Verify redirect URIs include:");
console.log("   - https://wdprvtqbwnhwbpufcmgg.supabase.co/auth/v1/callback");
console.log("   - http://localhost:8081/");

console.log("\n🎯 MOST LIKELY ISSUE:");
console.log("The Client Secret in your Supabase Dashboard doesn't match");
console.log("the one in Google Cloud Console, or the OAuth client is disabled.");

// Check if we can access the Google Cloud Console programmatically
async function checkGoogleCloudStatus() {
  console.log("\n🔍 Checking Google Cloud CLI access...");
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Try to get OAuth client info
    const cmd = `gcloud auth application-default print-access-token`;
    const { stdout } = await execAsync(cmd);
    
    if (stdout.trim()) {
      console.log("✅ Google Cloud CLI is authenticated");
      console.log("You can check OAuth client status manually in Google Cloud Console");
    }
    
  } catch (error) {
    console.log("❌ Cannot access Google Cloud CLI");
  }
}

checkGoogleCloudStatus(); 