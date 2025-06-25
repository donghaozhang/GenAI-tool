// Environment variable types
export interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_FAL_API_BASE_URL: string;
  readonly VITE_ELEVENLABS_API_BASE_URL: string;
  readonly VITE_OPENROUTER_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_DOMAIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Environment variable validation
export const validateEnvVars = () => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ] as const;

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

// Environment variable getters with defaults
export const getEnvVar = (key: keyof ImportMetaEnv, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set and no default provided`);
  }
  return value || defaultValue || '';
}; 