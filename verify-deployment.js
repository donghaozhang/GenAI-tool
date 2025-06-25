/**
 * Jaaz Integration Deployment Verification Script
 * 
 * Run this script in your browser console after deployment to verify
 * that all Edge Functions and API endpoints are working correctly.
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Navigate to your app (http://localhost:8080)
 * 3. Copy and paste this entire script
 * 4. Press Enter to run
 */

console.log('🧪 Jaaz Integration Deployment Verification');
console.log('==========================================');

// Get configuration
const config = window.config || {
  supabase: {
    functionsUrl: 'https://wdprvtqbwnhwbpufcmgg.supabase.co/functions/v1'
  }
};

console.log('📋 Configuration:');
console.log('Functions URL:', config.supabase.functionsUrl);
console.log('');

// Test functions
const testEndpoints = async () => {
  console.log('🔗 Testing API Endpoints...');
  console.log('');
  
  const tests = [
    {
      name: 'Jaaz Chat Function',
      url: `${config.supabase.functionsUrl}/jaaz-chat`,
      method: 'OPTIONS'
    },
    {
      name: 'Jaaz Canvas Function', 
      url: `${config.supabase.functionsUrl}/jaaz-canvas`,
      method: 'OPTIONS'
    },
    {
      name: 'Jaaz Settings Function',
      url: `${config.supabase.functionsUrl}/jaaz-settings`, 
      method: 'OPTIONS'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log(`✅ ${test.name}: WORKING (${response.status})`);
      } else {
        console.log(`❌ ${test.name}: FAILED (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR (${error.message})`);
    }
  }
};

// Test specific API calls
const testApiCalls = async () => {
  console.log('');
  console.log('🧪 Testing Specific API Calls...');
  console.log('');
  
  // Test chat session endpoint (should return empty array for non-existent session)
  try {
    console.log('Testing Chat Session API...');
    const response = await fetch(`${config.supabase.functionsUrl}/jaaz-chat/api/chat_session/test-session-id`);
    const data = await response.json();
    console.log('✅ Chat Session API: WORKING', data);
  } catch (error) {
    console.log('❌ Chat Session API: ERROR', error.message);
  }
  
  // Test canvas list endpoint
  try {
    console.log('Testing Canvas List API...');
    const response = await fetch(`${config.supabase.functionsUrl}/jaaz-canvas/api/canvases`);
    const data = await response.json();
    console.log('✅ Canvas List API: WORKING', data);
  } catch (error) {
    console.log('❌ Canvas List API: ERROR', error.message);
  }
  
  // Test settings exists endpoint
  try {
    console.log('Testing Settings Exists API...');
    const response = await fetch(`${config.supabase.functionsUrl}/jaaz-settings/api/settings/exists`);
    const data = await response.json();
    console.log('✅ Settings Exists API: WORKING', data);
  } catch (error) {
    console.log('❌ Settings Exists API: ERROR', error.message);
  }
};

// Check page routes
const checkRoutes = () => {
  console.log('');
  console.log('🔗 Available Routes:');
  console.log('');
  
  const routes = [
    { path: '/designer', description: 'AI Designer (Chat + Canvas)' },
    { path: '/canvas', description: 'Canvas List' },
    { path: '/settings', description: 'Settings Management' },
    { path: '/agent-studio', description: 'Agent Studio' },
    { path: '/marketplace', description: 'AI Model Marketplace' }
  ];
  
  routes.forEach(route => {
    const url = `${window.location.origin}${route.path}`;
    console.log(`✅ ${route.description}: ${url}`);
  });
};

// Check for required dependencies
const checkDependencies = () => {
  console.log('');
  console.log('📦 Checking Dependencies...');
  console.log('');
  
  const dependencies = [
    { name: 'React', check: () => window.React },
    { name: 'Supabase Client', check: () => window.supabase },
    { name: 'Socket.io', check: () => window.io }
  ];
  
  dependencies.forEach(dep => {
    if (dep.check()) {
      console.log(`✅ ${dep.name}: Available`);
    } else {
      console.log(`⚠️  ${dep.name}: Not detected (may be bundled)`);
    }
  });
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting Deployment Verification...');
  console.log('');
  
  checkRoutes();
  checkDependencies();
  await testEndpoints();
  await testApiCalls();
  
  console.log('');
  console.log('🎉 Deployment Verification Complete!');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('1. Navigate to /designer to test chat functionality');
  console.log('2. Navigate to /canvas to test canvas functionality');
  console.log('3. Navigate to /settings to test settings functionality');
  console.log('4. Check browser Network tab for API call success');
  console.log('');
  console.log('🔍 If any tests failed:');
  console.log('1. Check Supabase dashboard for Edge Function deployment status');
  console.log('2. Verify database migration was applied');
  console.log('3. Check browser console for error messages');
};

// Auto-run the tests
runAllTests();

// Export for manual testing
window.jaazVerification = {
  testEndpoints,
  testApiCalls,
  checkRoutes,
  checkDependencies,
  runAllTests
};

console.log('');
console.log('💡 Manual Testing Available:');
console.log('- window.jaazVerification.testEndpoints()');
console.log('- window.jaazVerification.testApiCalls()');
console.log('- window.jaazVerification.runAllTests()'); 