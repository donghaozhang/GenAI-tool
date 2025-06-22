// Test OAuth using the React app's Supabase client
// Run this in browser console on http://localhost:8080/auth

console.log('🧪 Testing OAuth through React App');
console.log('==================================');

// Function to find React components and extract Supabase client
function findSupabaseClient() {
  // Try to find React fiber node with Supabase client
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.log('❌ React root element not found');
    return null;
  }

  // Look for React fiber
  const fiberKey = Object.keys(rootElement).find(key => 
    key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
  );
  
  if (fiberKey) {
    console.log('✅ React fiber found');
    // Try to access through React DevTools global
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('✅ React DevTools available');
    }
  }
  
  return null;
}

// Function to simulate clicking the Google login button
function clickGoogleLoginButton() {
  console.log('🔍 Looking for Google login button...');
  
  // Look for buttons with Google-related text or classes
  const buttons = document.querySelectorAll('button');
  let googleButton = null;
  
  for (const button of buttons) {
    const text = button.textContent.toLowerCase();
    if (text.includes('google') || text.includes('continue with google')) {
      googleButton = button;
      break;
    }
  }
  
  if (googleButton) {
    console.log('✅ Found Google login button:', googleButton.textContent);
    console.log('🖱️ Clicking Google login button...');
    
    // Add event listener to catch any errors
    window.addEventListener('error', (e) => {
      console.error('❌ Error during OAuth:', e.error);
    });
    
    // Click the button
    googleButton.click();
    
    // Monitor for navigation or popup
    setTimeout(() => {
      if (window.location.href !== 'http://localhost:8080/auth') {
        console.log('✅ Navigation detected - OAuth initiated');
      } else {
        console.log('⚠️ No navigation detected - check for popup or errors');
      }
    }, 2000);
    
    return true;
  } else {
    console.log('❌ Google login button not found');
    console.log('Available buttons:', Array.from(buttons).map(b => b.textContent));
    return false;
  }
}

// Function to check current page state
function checkPageState() {
  console.log('📊 Current Page State:');
  console.log('URL:', window.location.href);
  console.log('Title:', document.title);
  
  // Check for error messages
  const errorElements = document.querySelectorAll('[class*="error"], .text-red-500, .text-destructive');
  if (errorElements.length > 0) {
    console.log('⚠️ Error elements found:');
    errorElements.forEach(el => console.log('-', el.textContent));
  }
  
  // Check for loading states
  const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
  if (loadingElements.length > 0) {
    console.log('⏳ Loading elements found');
  }
}

// Function to monitor network requests
function monitorNetworkRequests() {
  console.log('🌐 Monitoring network requests...');
  
  // Override fetch to log OAuth-related requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && (url.includes('oauth') || url.includes('auth'))) {
      console.log('🔗 OAuth request detected:', url);
    }
    return originalFetch.apply(this, args);
  };
  
  // Monitor for 401 errors in console
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('401') || message.includes('invalid_client')) {
      console.log('🚨 OAuth error detected:', message);
    }
    return originalConsoleError.apply(this, args);
  };
}

// Main test function
function testOAuthThroughApp() {
  console.log('\n🚀 Starting OAuth test through app...');
  
  checkPageState();
  monitorNetworkRequests();
  
  // Try to click the Google login button
  const success = clickGoogleLoginButton();
  
  if (!success) {
    console.log('\n💡 Manual steps:');
    console.log('1. Look for the "Continue with Google" button on the page');
    console.log('2. Click it manually');
    console.log('3. Watch the console for OAuth-related messages');
  }
  
  return success;
}

// Create a test button
function createTestButton() {
  const button = document.createElement('button');
  button.innerHTML = '🧪 Test OAuth via App';
  button.style.cssText = `
    position: fixed;
    top: 110px;
    right: 10px;
    z-index: 10000;
    background: #34a853;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  
  button.onclick = testOAuthThroughApp;
  document.body.appendChild(button);
  
  console.log('🎯 Test button created (click to test OAuth through app)');
}

// Initialize
findSupabaseClient();
createTestButton();

// Export functions
window.testOAuthThroughApp = testOAuthThroughApp;
window.clickGoogleLoginButton = clickGoogleLoginButton;

console.log('\n💡 Next Steps:');
console.log('1. Make sure Supabase Dashboard is updated with correct credentials');
console.log('2. Click "🧪 Test OAuth via App" button');
console.log('3. Or manually click the "Continue with Google" button on the page');
console.log('4. Watch console for OAuth flow messages'); 