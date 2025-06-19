/// <reference types="vite/client" />

interface ImportMetaEnv {
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
