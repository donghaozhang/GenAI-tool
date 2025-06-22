// Quick OAuth Test - Copy and paste into browser console
// This is a simplified version for immediate testing

console.clear();
console.log("🚀 Quick Google OAuth Test");
console.log("=" .repeat(30));

// Get client ID from environment or prompt user to set it
const clientId = process.env.VITE_GOOGLE_CLIENT_ID || "CLIENT_ID_NOT_SET_IN_ENV";

if (clientId === "CLIENT_ID_NOT_SET_IN_ENV") {
  console.log('❌ VITE_GOOGLE_CLIENT_ID not found in environment variables');
  console.log('Please set your Google Client ID in .env file');
  console.log('Example: VITE_GOOGLE_CLIENT_ID=your_client_id_here');
} else {
  console.log('✅ Using Client ID from environment variables');
}

// Test 1: Check current configuration
console.log("\n📊 Current Configuration:");
console.log("URL:", window.location.href);
console.log("Origin:", window.location.origin);

// Test 2: Create direct OAuth test link
const redirectUri = "https://wdprvtqbwnhwbpufcmgg.supabase.co/auth/v1/callback";
const testUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email+profile`;

console.log("\n🔗 Direct OAuth Test URL:");
console.log(testUrl);

// Test 3: Create clickable test button
const testButton = document.createElement('button');
testButton.textContent = 'Test Google OAuth';
testButton.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  padding: 15px 20px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

testButton.onclick = () => {
  window.open(testUrl, '_blank');
};

document.body.appendChild(testButton);

console.log("🎯 Test button added to page (top-right corner)");

// Test 4: Monitor for OAuth errors
window.addEventListener('error', (e) => {
  if (e.message && (e.message.includes('oauth') || e.message.includes('auth'))) {
    console.log("🚨 OAuth Error detected:", e.message);
  }
});

// Test 5: Check for Supabase client
if (typeof window.supabase !== 'undefined') {
  console.log("✅ Supabase client found");
  
  // Try to trigger OAuth
  window.testSupabaseOAuth = async () => {
    try {
      console.log("🧪 Testing Supabase OAuth...");
      const { data, error } = await window.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.log("❌ Supabase OAuth Error:", error);
      } else {
        console.log("✅ Supabase OAuth initiated successfully");
      }
    } catch (err) {
      console.log("❌ Error calling Supabase OAuth:", err);
    }
  };
  
  console.log("🎯 Run: testSupabaseOAuth() to test Supabase OAuth");
} else {
  console.log("⚠️ Supabase client not found");
}

// Test 6: Quick fixes
console.log("\n🔧 Quick Fixes:");
console.log("1. Clear cache: Ctrl+Shift+Delete");
console.log("2. Try incognito mode");
console.log("3. Check Network tab for 401 errors");
console.log("4. Verify Client Secret in Supabase Dashboard");

// Auto-remove test button after 60 seconds
setTimeout(() => {
  if (document.body.contains(testButton)) {
    document.body.removeChild(testButton);
    console.log("🗑️ Test button removed");
  }
}, 60000);

console.log("\n✅ Quick test setup complete!");
console.log("💡 Click the blue button or run testSupabaseOAuth() to test"); 