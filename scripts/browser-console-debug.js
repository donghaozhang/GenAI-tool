// Browser Console Debug Script for Google OAuth
// Copy and paste this entire script into your browser console (F12 -> Console tab)

console.log("🔍 Google OAuth Browser Console Debugger");
console.log("=" .repeat(50));

// Function to test Supabase OAuth endpoint
async function testSupabaseOAuth() {
  console.log("\n📡 Testing Supabase OAuth Endpoint...");
  
  const supabaseUrl = "https://wdprvtqbwnhwbpufcmgg.supabase.co";
  const testUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin)}`;
  
  try {
    const response = await fetch(testUrl, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    
    console.log("✅ Supabase OAuth endpoint is accessible");
    console.log("🔗 Test URL:", testUrl);
    
    // Try to get the redirect URL by making a GET request
    console.log("\n🔄 Getting OAuth redirect URL...");
    
    // Create a temporary iframe to capture the redirect
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = testUrl;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      try {
        const redirectUrl = iframe.contentWindow.location.href;
        console.log("📍 Redirect URL:", redirectUrl);
        
        // Extract client_id from URL
        const clientIdMatch = redirectUrl.match(/client_id=([^&]+)/);
        if (clientIdMatch) {
          const clientId = decodeURIComponent(clientIdMatch[1]);
          console.log("🔑 Client ID being used:", clientId);
          
          // Check if it matches expected
          const expectedClientId = "389790994997-qcla9r90kd25v9j46n6qj9je54o2dn6q9ge5g4c2dn2.apps.googleusercontent.com";
          if (clientId === expectedClientId) {
            console.log("✅ Client ID matches expected value");
          } else {
            console.log("❌ Client ID mismatch!");
            console.log("Expected:", expectedClientId);
            console.log("Actual:", clientId);
          }
        }
      } catch (e) {
        console.log("⚠️ Cannot access iframe content (CORS), but endpoint is working");
      }
      
      document.body.removeChild(iframe);
    }, 2000);
    
  } catch (error) {
    console.log("❌ Error testing Supabase endpoint:", error.message);
  }
}

// Function to test Google OAuth endpoint directly
async function testGoogleOAuth() {
  console.log("\n🌐 Testing Google OAuth Endpoint...");
  
  const clientId = "389790994997-qcla9r90kd25v9j46n6qj9je54o2dn6q9ge5g4c2dn2.apps.googleusercontent.com";
  const redirectUri = "https://wdprvtqbwnhwbpufcmgg.supabase.co/auth/v1/callback";
  
  const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email+profile`;
  
  console.log("🔗 Direct Google OAuth URL:");
  console.log(googleOAuthUrl);
  
  try {
    const response = await fetch(googleOAuthUrl, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log("✅ Google OAuth endpoint is accessible");
  } catch (error) {
    console.log("❌ Error accessing Google OAuth:", error.message);
  }
}

// Function to check current page configuration
function checkCurrentPageConfig() {
  console.log("\n📄 Current Page Configuration:");
  console.log("Current URL:", window.location.href);
  console.log("Origin:", window.location.origin);
  console.log("Protocol:", window.location.protocol);
  console.log("Host:", window.location.host);
  
  // Check if Supabase client is available
  if (typeof window.supabase !== 'undefined') {
    console.log("✅ Supabase client is available");
  } else {
    console.log("⚠️ Supabase client not found in global scope");
  }
  
  // Check for any OAuth-related errors in console
  console.log("\n🔍 Checking for OAuth-related items in localStorage:");
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('oauth') || key.includes('auth'))) {
      console.log(`📦 ${key}:`, localStorage.getItem(key));
    }
  }
}

// Function to test OAuth flow manually
function testOAuthFlow() {
  console.log("\n🧪 Manual OAuth Flow Test:");
  console.log("Click the link below to test OAuth manually:");
  
  const clientId = "389790994997-qcla9r90kd25v9j46n6qj9je54o2dn6q9ge5g4c2dn2.apps.googleusercontent.com";
  const redirectUri = "https://wdprvtqbwnhwbpufcmgg.supabase.co/auth/v1/callback";
  const testUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email+profile&state=test`;
  
  console.log("🔗 Test URL:", testUrl);
  
  // Create a clickable link
  const link = document.createElement('a');
  link.href = testUrl;
  link.target = '_blank';
  link.textContent = 'Click here to test OAuth';
  link.style.cssText = 'display: block; padding: 10px; background: #4285f4; color: white; text-decoration: none; margin: 10px 0; border-radius: 4px; width: fit-content;';
  
  console.log("📎 Clickable link created (check page for blue button)");
  document.body.appendChild(link);
  
  // Auto-remove after 30 seconds
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 30000);
}

// Function to check network requests
function monitorNetworkRequests() {
  console.log("\n🌐 Network Request Monitor:");
  console.log("Monitoring OAuth-related network requests...");
  
  // Override fetch to monitor requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && (url.includes('oauth') || url.includes('auth') || url.includes('google'))) {
      console.log("🌐 OAuth Request:", url);
    }
    return originalFetch.apply(this, args);
  };
  
  console.log("✅ Network monitoring enabled. OAuth requests will be logged.");
  console.log("To disable: window.fetch = originalFetch");
}

// Function to show quick fix suggestions
function showQuickFixes() {
  console.log("\n🔧 QUICK FIXES TO TRY:");
  console.log("1. Clear browser cache and cookies");
  console.log("2. Check Supabase Dashboard Client Secret");
  console.log("3. Verify Google Cloud Console OAuth client is enabled");
  console.log("4. Test in incognito/private browsing mode");
  
  console.log("\n🔗 Quick Links:");
  console.log("• Supabase Auth: https://supabase.com/dashboard/project/wdprvtqbwnhwbpufcmgg/auth/providers");
  console.log("• Google Console: https://console.cloud.google.com/apis/credentials?project=speedy-sunspot-460603-p7");
}

// Main execution
async function runAllTests() {
  checkCurrentPageConfig();
  await testSupabaseOAuth();
  await testGoogleOAuth();
  testOAuthFlow();
  monitorNetworkRequests();
  showQuickFixes();
  
  console.log("\n✅ Diagnostic complete! Check the results above.");
  console.log("💡 If you see any errors, focus on fixing those first.");
}

// Auto-run all tests
runAllTests();

// Make functions available globally for manual testing
window.oauthDebug = {
  testSupabaseOAuth,
  testGoogleOAuth,
  checkCurrentPageConfig,
  testOAuthFlow,
  monitorNetworkRequests,
  showQuickFixes,
  runAllTests
};

console.log("\n🎯 Available Commands:");
console.log("• oauthDebug.runAllTests() - Run all tests again");
console.log("• oauthDebug.testSupabaseOAuth() - Test Supabase endpoint");
console.log("• oauthDebug.testGoogleOAuth() - Test Google endpoint");
console.log("• oauthDebug.testOAuthFlow() - Create test OAuth link");
console.log("• oauthDebug.monitorNetworkRequests() - Monitor network requests"); 