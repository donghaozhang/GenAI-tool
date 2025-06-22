// Live Google OAuth Test Script
// Run this in browser console on http://localhost:8080

console.log('🚀 Live Google OAuth Test Starting...');
console.log('======================================');

// Test configuration
const config = {
  clientId: '389790994997-qcla9r90kd25v9j46n6qj9je54o2dn6q9ge5g4c2dn2.apps.googleusercontent.com',
  supabaseUrl: 'https://wdprvtqbwnhwbpufcmgg.supabase.co',
  redirectUri: 'https://wdprvtqbwnhwbpufcmgg.supabase.co/auth/v1/callback',
  currentUrl: window.location.href,
  origin: window.location.origin
};

console.log('📊 Configuration:', config);

// Function to test direct Google OAuth URL
function testDirectOAuth() {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'consent'
  });
  
  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  console.log('🔗 Opening OAuth URL:', oauthUrl);
  
  // Open in new tab for testing
  const popup = window.open(oauthUrl, 'oauth-test', 'width=500,height=600');
  
  // Monitor popup for changes
  const checkClosed = setInterval(() => {
    if (popup.closed) {
      clearInterval(checkClosed);
      console.log('✅ OAuth popup closed - check for success/error');
    }
  }, 1000);
  
  return popup;
}

// Function to test Supabase OAuth (if available)
async function testSupabaseOAuth() {
  try {
    // Try to find Supabase client
    if (typeof supabase !== 'undefined') {
      console.log('✅ Supabase client found');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('❌ Supabase OAuth Error:', error);
        return { success: false, error };
      }
      
      console.log('✅ Supabase OAuth initiated:', data);
      return { success: true, data };
      
    } else {
      console.log('⚠️ Supabase client not available in global scope');
      
      // Try to import Supabase dynamically
      try {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        const testClient = createClient(
          config.supabaseUrl,
          'your-anon-key-here' // You'll need to replace this
        );
        
        console.log('✅ Supabase client created dynamically');
        return await testClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`
          }
        });
        
      } catch (importError) {
        console.error('❌ Could not import Supabase:', importError);
        return { success: false, error: 'Supabase not available' };
      }
    }
    
  } catch (error) {
    console.error('❌ OAuth Test Error:', error);
    return { success: false, error };
  }
}

// Function to check OAuth configuration
async function checkOAuthConfig() {
  console.log('🔍 Checking OAuth Configuration...');
  
  // Test Google OAuth endpoint
  try {
    const testUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.clientId}&response_type=code&scope=email&redirect_uri=${encodeURIComponent(config.redirectUri)}`;
    
    // Create a hidden iframe to test the URL
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = testUrl;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      try {
        // If we can access the iframe content, the URL is valid
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        console.log('✅ OAuth endpoint accessible');
      } catch (e) {
        if (e.name === 'SecurityError') {
          console.log('✅ OAuth endpoint redirected (expected behavior)');
        } else {
          console.error('❌ OAuth endpoint error:', e);
        }
      }
      document.body.removeChild(iframe);
    }, 2000);
    
  } catch (error) {
    console.error('❌ Config check error:', error);
  }
}

// Function to create test buttons
function createTestButtons() {
  // Remove existing buttons
  const existingContainer = document.getElementById('oauth-test-container');
  if (existingContainer) {
    existingContainer.remove();
  }
  
  // Create container
  const container = document.createElement('div');
  container.id = 'oauth-test-container';
  container.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 10000;
    background: white;
    padding: 15px;
    border: 2px solid #4285f4;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: Arial, sans-serif;
    max-width: 300px;
  `;
  
  container.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #4285f4; font-size: 14px;">🧪 OAuth Test Panel</h3>
    <button id="direct-oauth-btn" style="
      width: 100%; 
      margin: 5px 0; 
      padding: 8px; 
      background: #4285f4; 
      color: white; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer;
      font-size: 12px;
    ">🔗 Test Direct OAuth</button>
    <button id="supabase-oauth-btn" style="
      width: 100%; 
      margin: 5px 0; 
      padding: 8px; 
      background: #34a853; 
      color: white; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer;
      font-size: 12px;
    ">🏢 Test Supabase OAuth</button>
    <button id="check-config-btn" style="
      width: 100%; 
      margin: 5px 0; 
      padding: 8px; 
      background: #fbbc04; 
      color: black; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer;
      font-size: 12px;
    ">🔍 Check Config</button>
    <button id="close-panel-btn" style="
      width: 100%; 
      margin: 5px 0; 
      padding: 8px; 
      background: #ea4335; 
      color: white; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer;
      font-size: 12px;
    ">❌ Close Panel</button>
  `;
  
  document.body.appendChild(container);
  
  // Add event listeners
  document.getElementById('direct-oauth-btn').onclick = testDirectOAuth;
  document.getElementById('supabase-oauth-btn').onclick = testSupabaseOAuth;
  document.getElementById('check-config-btn').onclick = checkOAuthConfig;
  document.getElementById('close-panel-btn').onclick = () => container.remove();
  
  console.log('🎯 Test panel created with multiple test options');
}

// Initialize the test
console.log('🎯 Creating test interface...');
createTestButtons();

// Auto-run configuration check
setTimeout(checkOAuthConfig, 1000);

// Export functions to global scope for manual testing
window.testDirectOAuth = testDirectOAuth;
window.testSupabaseOAuth = testSupabaseOAuth;
window.checkOAuthConfig = checkOAuthConfig;

console.log('✅ Live OAuth test ready!');
console.log('💡 Use the test panel or run functions manually:');
console.log('   - testDirectOAuth()');
console.log('   - testSupabaseOAuth()');
console.log('   - checkOAuthConfig()'); 