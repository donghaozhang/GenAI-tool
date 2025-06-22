// Script to help find the correct OAuth client configuration
// This provides guidance on finding the right client ID in Google Cloud Console

console.log('🔍 Finding Correct OAuth Client Configuration');
console.log('===========================================');

console.log(`
🚨 ISSUE IDENTIFIED: Client ID not found by Google
Current Client ID: 389790994997-qcla9r90kd25v9j46n6qj9je54o2dn6q9ge5g4c2dn2.apps.googleusercontent.com
Error: "invalid_client - The OAuth client was not found"

📋 STEP-BY-STEP SOLUTION:

1. 🌐 Go to Google Cloud Console:
   https://console.cloud.google.com/apis/credentials?project=speedy-sunspot-460603-p7

2. 🔍 Look for OAuth 2.0 Client IDs section
   - You should see one or more OAuth clients listed
   - Each will have a name and Client ID

3. ✅ Find the CORRECT client by checking:
   - Client ID format: 389790994997-[random-string].apps.googleusercontent.com
   - Should have "Web application" type
   - Should have authorized redirect URIs including:
     * https://wdprvtqbwnhwbpufcmgg.supabase.co/auth/v1/callback
     * http://localhost:8080/auth/callback (optional)

4. 📝 Copy the EXACT Client ID from the correct client

5. 🔧 Update your .env file with the correct Client ID

6. 🔄 Restart your development server

🎯 WHAT TO LOOK FOR:
- The Client ID in your .env might be missing characters
- There might be multiple OAuth clients - use the one with proper redirect URIs
- The client might be in a different Google Cloud project

🔗 Direct Console Link:
https://console.cloud.google.com/apis/credentials?project=speedy-sunspot-460603-p7

💡 ALTERNATIVE: Create a new OAuth client if none exist with proper configuration
`);

// Function to validate a new client ID format
function validateClientId(clientId) {
  const pattern = /^389790994997-[a-z0-9]{32}\.apps\.googleusercontent\.com$/;
  const isValid = pattern.test(clientId);
  
  console.log(`\n🔍 Validating Client ID: ${clientId}`);
  console.log(`✅ Format valid: ${isValid}`);
  
  if (!isValid) {
    console.log('❌ Client ID format is incorrect');
    console.log('Expected format: 389790994997-[32 random characters].apps.googleusercontent.com');
  }
  
  return isValid;
}

// Function to test a client ID
async function testClientId(clientId) {
  console.log(`\n🧪 Testing Client ID: ${clientId}`);
  
  if (!validateClientId(clientId)) {
    return false;
  }
  
  const testUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&scope=email&redirect_uri=https%3A%2F%2Fwdprvtqbwnhwbpufcmgg.supabase.co%2Fauth%2Fv1%2Fcallback`;
  
  try {
    // Test the URL in a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = testUrl;
    document.body.appendChild(iframe);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // If no error occurs, the client ID might be valid
          console.log('✅ Client ID test completed - check for 403 errors in Network tab');
          document.body.removeChild(iframe);
          resolve(true);
        } catch (e) {
          console.log('⚠️ Test completed with potential issues');
          document.body.removeChild(iframe);
          resolve(false);
        }
      }, 3000);
    });
    
  } catch (error) {
    console.error('❌ Client ID test failed:', error);
    return false;
  }
}

// Export functions for manual use
window.validateClientId = validateClientId;
window.testClientId = testClientId;

console.log('\n🛠️ Available Functions:');
console.log('- validateClientId("your-client-id-here")');
console.log('- testClientId("your-client-id-here")');
console.log('\n💡 Next: Go to Google Cloud Console and find the correct Client ID'); 