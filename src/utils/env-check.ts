// Environment variable debugging utility
export const checkEnvironmentVariables = () => {
  console.log('🔍 Environment Variables Check:');
  console.log('================================');
  
  const envVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_FAL_API_BASE_URL',
    'VITE_ELEVENLABS_API_BASE_URL',
    'VITE_OPENROUTER_API_BASE_URL',
    'VITE_APP_NAME',
    'VITE_APP_DOMAIN'
  ];

  envVars.forEach(varName => {
    const value = import.meta.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value 
      ? (varName.includes('KEY') || varName.includes('TOKEN') 
         ? `${value.substring(0, 10)}...` 
         : value)
      : 'NOT SET';
    
    console.log(`${status} ${varName}: ${displayValue}`);
  });

  console.log('================================');
  
  // Check for critical missing variables
  const critical = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = critical.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.error('🚨 CRITICAL: Missing required environment variables:', missing);
    console.error('Please check your .env file!');
    return false;
  }
  
  console.log('✅ All critical environment variables are set!');
  return true;
};

// Development helper - only runs in development mode
if (import.meta.env.DEV) {
  checkEnvironmentVariables();
} 