// Centralized environment configuration
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    functionsUrl: import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 
                  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`,
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

// Initialize validation
validateConfig(); 