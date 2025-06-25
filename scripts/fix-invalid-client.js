// scripts/fix-invalid-client.js
// Comprehensive guide to fix the invalid_client error

console.log("🔧 Fix Invalid Client Error - Step by Step Guide");
console.log("=" .repeat(60));

console.log("\n🚨 ERROR ANALYSIS:");
console.log("You're getting 'Error 401: invalid_client' from Google OAuth");
console.log("This typically means one of these issues:");

console.log("\n❌ MOST COMMON CAUSES:");
console.log("1. ❌ Client Secret mismatch between Google Cloud Console and Supabase");
console.log("2. ❌ OAuth client is disabled in Google Cloud Console");
console.log("3. ❌ Redirect URI mismatch or missing");
console.log("4. ❌ JavaScript origins not properly configured");
console.log("5. ❌ OAuth consent screen not properly published");

console.log("\n🔧 STEP-BY-STEP FIX:");

console.log("\n📋 STEP 1: Check Google Cloud Console OAuth Client");
console.log("1. Go to: https://console.cloud.google.com/apis/credentials?project=speedy-sunspot-460603-p7");
console.log("2. Find OAuth 2.0 Client: 389790994997-qcla9r90kd25v9j46n6qj9je54o2dn6q9ge5g4c2dn2");
console.log("3. Click on it to open details");
console.log("4. Verify these settings:");

console.log("\n   ✅ REQUIRED SETTINGS:");
console.log("   - Status: ENABLED (not disabled)");
console.log("   - Authorized JavaScript origins:");
console.log("     • https://wdprvtqbwnhwbpufcmgg.supabase.co");
console.log("     • http://localhost:8081");
console.log("     • http://localhost:8080");
console.log("     • http://localhost:8082");
console.log("   - Authorized redirect URIs:");
console.log("     • https://wdprvtqbwnhwbpufcmgg.supabase.co/auth/v1/callback");
console.log("     • http://localhost:8081/");
console.log("     • http://localhost:8080/");
console.log("     • http://localhost:8082/");

console.log("\n📋 STEP 2: Get the Correct Client Secret");
console.log("1. In the OAuth client details, find 'Client secrets'");
console.log("2. Copy the FULL client secret (starts with GOCSPX-)");
console.log("3. It should look like: GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxx");

console.log("\n📋 STEP 3: Update Supabase Dashboard");
console.log("1. Go to: https://supabase.com/dashboard/project/wdprvtqbwnhwbpufcmgg/auth/providers");
console.log("2. Find Google provider");
console.log("3. Update Client Secret with the EXACT secret from Google Cloud Console");
console.log("4. Ensure Client ID is: 389790994997-qcla9r90kd25v9j46n6qj9je54o2dn6q9ge5g4c2dn2.apps.googleusercontent.com");
console.log("5. Save changes");

console.log("\n📋 STEP 4: Check OAuth Consent Screen");
console.log("1. Go to: https://console.cloud.google.com/apis/credentials/consent?project=speedy-sunspot-460603-p7");
console.log("2. Verify status is 'In production' or 'Published'");
console.log("3. Ensure all required fields are filled");

console.log("\n📋 STEP 5: Test Configuration");
console.log("1. Clear browser cache and cookies");
console.log("2. Go to: http://localhost:8081/");
console.log("3. Try Google OAuth login");
console.log("4. If still fails, check browser console for errors");

console.log("\n🎯 QUICK VERIFICATION CHECKLIST:");
console.log("□ OAuth client is ENABLED in Google Cloud Console");
console.log("□ Client Secret in Supabase matches Google Cloud Console exactly");
console.log("□ All redirect URIs are configured");
console.log("□ JavaScript origins are configured");
console.log("□ OAuth consent screen is published");
console.log("□ Browser cache is cleared");

console.log("\n⚡ IMMEDIATE ACTION:");
console.log("The most likely fix is updating the Client Secret in Supabase Dashboard.");
console.log("Go to Supabase → Auth → Providers → Google and verify the Client Secret matches Google Cloud Console.");

console.log("\n🔗 DIRECT LINKS:");
console.log("• Google Cloud Console OAuth: https://console.cloud.google.com/apis/credentials?project=speedy-sunspot-460603-p7");
console.log("• Supabase Auth Providers: https://supabase.com/dashboard/project/wdprvtqbwnhwbpufcmgg/auth/providers");
console.log("• OAuth Consent Screen: https://console.cloud.google.com/apis/credentials/consent?project=speedy-sunspot-460603-p7"); 