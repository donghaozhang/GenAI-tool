// Environment mode detection
const envMode = import.meta.env.VITE_ENV_MODE || 'local';
const isLocal = envMode === 'local';

// Auto-select Supabase configuration based on environment mode
const getSupabaseConfig = () => {
  if (isLocal) {
    return {
      url: import.meta.env.VITE_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321',
      anonKey: import.meta.env.VITE_SUPABASE_LOCAL_ANON_KEY,
    };
  } else {
    return {
      url: import.meta.env.VITE_SUPABASE_REMOTE_URL || import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_REMOTE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
    };
  }
};

const supabaseConfig = getSupabaseConfig();

// Centralized environment configuration
export const config = {
  environment: {
    mode: envMode,
    isLocal,
    isRemote: !isLocal,
  },
  supabase: {
    url: supabaseConfig.url,
    anonKey: supabaseConfig.anonKey,
    functionsUrl: import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 
                  `${supabaseConfig.url}/functions/v1`,
  },
  api: {
    fal: {
      baseUrl: import.meta.env.VITE_FAL_API_BASE_URL || 'https://fal.run',
      apiKey: import.meta.env.VITE_FAL_API_KEY,
    },
    elevenlabs: {
      baseUrl: import.meta.env.VITE_ELEVENLABS_API_BASE_URL || 'https://api.elevenlabs.io',
    },
    openrouter: {
      baseUrl: import.meta.env.VITE_OPENROUTER_API_BASE_URL || 'https://openrouter.ai',
    },
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || '', // Only used server-side
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'AI Model Marketplace',
    domain: import.meta.env.VITE_APP_DOMAIN || 'localhost:8080',
    environment: import.meta.env.MODE || 'development',
    isDevelopment: import.meta.env.MODE === 'development',
    isProduction: import.meta.env.MODE === 'production',
  },
} as const;

// Validation function
export const validateConfig = () => {
  const requiredFields = [
    { key: 'supabase.url', value: config.supabase.url },
    { key: 'supabase.anonKey', value: config.supabase.anonKey },
  ];

  const missingFields = requiredFields.filter(field => !field.value);

  if (missingFields.length > 0) {
    const missingKeys = missingFields.map(field => field.key).join(', ');
    throw new Error(
      `Missing required configuration: ${missingKeys}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

// Initialize validation and log current configuration
if (import.meta.env.DEV) {
  try {
    validateConfig();
    console.log(`🚀 Environment Mode: ${config.environment.mode.toUpperCase()}`);
    console.log(`📡 Supabase URL: ${config.supabase.url}`);
    console.log(`🔧 Functions URL: ${config.supabase.functionsUrl}`);
    console.log(`💳 Stripe Available: ${config.stripe.publishableKey ? '✅' : '❌'}`);
  } catch (error) {
    console.warn('Environment validation warning:', error);
  }
} 