// Script to verify Supabase OAuth configuration
// Run this after updating Supabase Dashboard

console.log('🔍 Verifying Supabase OAuth Configuration');
console.log('=========================================');

// Expected configuration based on Google Cloud Console
const expectedConfig = {
  clientId: '389790994997-qcla9r90kd25v9j46n6qj9je54o2dn2.apps.googleusercontent.com',
  redirectUri: 'https://wdprvtqbwnhwbpufcmgg.supabase.co/auth/v1/callback',
  supabaseUrl: 'https://wdprvtqbwnhwbpufcmgg.supabase.co'
};

console.log('📋 Expected Configuration:');
console.log('Client ID:', expectedConfig.clientId);
console.log('Redirect URI:', expectedConfig.redirectUri);
console.log('Supabase URL:', expectedConfig.supabaseUrl);

// Function to test Supabase OAuth after configuration update
async function testSupabaseOAuthConfig() {
  console.log('\n🧪 Testing Supabase OAuth Configuration...');
  
  try {
    // Check if Supabase client is available
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase client not found');
      return false;
    }
    
    console.log('✅ Supabase client found');
    
    // Test OAuth initiation
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
    
    if (error) {
      console.error('❌ Supabase OAuth Error:', error);
      console.log('\n🔧 Troubleshooting Steps:');
      console.log('1. Verify Client ID in Supabase Dashboard matches Google Console');
      console.log('2. Verify Client Secret in Supabase Dashboard matches Google Console');
      console.log('3. Check that Google OAuth consent screen is published');
      console.log('4. Ensure redirect URI is exactly: https://wdprvtqbwnhwbpufcmgg.supabase.co/auth/v1/callback');
      return false;
    }
    
    console.log('✅ Supabase OAuth initiated successfully:', data);
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Function to check current environment
function checkEnvironment() {
  console.log('\n🌍 Environment Check:');
  console.log('Current URL:', window.location.href);
  console.log('Origin:', window.location.origin);
  
  // Check if we're on the right port
  if (window.location.port !== '8080') {
    console.warn('⚠️ Warning: Expected port 8080, currently on port', window.location.port);
  }
}

// Function to create a test button for easy access
function createTestButton() {
  // Remove existing button
  const existingBtn = document.getElementById('supabase-oauth-test-btn');
  if (existingBtn) {
    existingBtn.remove();
  }
  
  // Create test button
  const button = document.createElement('button');
  button.id = 'supabase-oauth-test-btn';
  button.innerHTML = '🧪 Test Supabase OAuth';
  button.style.cssText = `
    position: fixed;
    top: 60px;
    right: 10px;
    z-index: 10000;
    background: #4285f4;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  
  button.onclick = testSupabaseOAuthConfig;
  document.body.appendChild(button);
  
  console.log('🎯 Test button created (top-right corner)');
}

// Run initial checks
checkEnvironment();
createTestButton();

// Export functions
window.testSupabaseOAuthConfig = testSupabaseOAuthConfig;
window.checkEnvironment = checkEnvironment;

console.log('\n💡 Next Steps:');
console.log('1. Update Supabase Dashboard with correct Client ID and Secret');
console.log('2. Click the "🧪 Test Supabase OAuth" button');
console.log('3. Or run: testSupabaseOAuthConfig()');

console.log('\n🔗 Supabase Dashboard Link:');
console.log('https://supabase.com/dashboard/project/wdprvtqbwnhwbpufcmgg/auth/providers'); 