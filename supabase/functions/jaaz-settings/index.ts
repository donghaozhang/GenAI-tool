import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Types for settings functionality
interface ProviderConfig {
  id: string
  name: string
  type: 'openai' | 'anthropic' | 'ollama' | 'custom'
  api_key?: string
  base_url?: string
  models?: string[]
  enabled: boolean
  created_at?: string
  updated_at?: string
}

interface UserSettings {
  id: string
  user_id: string
  key: string
  value: any
  created_at?: string
  updated_at?: string
}

interface SettingsRequest {
  key: string
  value: any
  user_id?: string
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Settings service
class SettingsService {
  // Provider management
  async createProvider(provider: Omit<ProviderConfig, 'id' | 'created_at' | 'updated_at'>): Promise<ProviderConfig> {
    const providerData = {
      id: crypto.randomUUID(),
      ...provider,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('ai_providers')
      .insert(providerData)

    if (error) {
      console.error('Error creating provider:', error)
      throw error
    }

    return providerData
  }

  async getProviders(): Promise<ProviderConfig[]> {
    const { data, error } = await supabase
      .from('ai_providers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching providers:', error)
      throw error
    }

    return data || []
  }

  async updateProvider(providerId: string, updates: Partial<ProviderConfig>): Promise<void> {
    const { error } = await supabase
      .from('ai_providers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', providerId)

    if (error) {
      console.error('Error updating provider:', error)
      throw error
    }
  }

  async deleteProvider(providerId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_providers')
      .delete()
      .eq('id', providerId)

    if (error) {
      console.error('Error deleting provider:', error)
      throw error
    }
  }

  // User settings management
  async setUserSetting(userId: string, key: string, value: any): Promise<void> {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        key,
        value: JSON.stringify(value),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,key'
      })

    if (error) {
      console.error('Error setting user setting:', error)
      throw error
    }
  }

  async getUserSetting(userId: string, key: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('value')
      .eq('user_id', userId)
      .eq('key', key)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      console.error('Error getting user setting:', error)
      throw error
    }

    return data ? JSON.parse(data.value) : null
  }

  async getUserSettings(userId: string): Promise<UserSettings[]> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error getting user settings:', error)
      throw error
    }

    return data || []
  }

  async deleteUserSetting(userId: string, key: string): Promise<void> {
    const { error } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', userId)
      .eq('key', key)

    if (error) {
      console.error('Error deleting user setting:', error)
      throw error
    }
  }

  // System settings (global)
  async setSystemSetting(key: string, value: any): Promise<void> {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key,
        value: JSON.stringify(value),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })

    if (error) {
      console.error('Error setting system setting:', error)
      throw error
    }
  }

  async getSystemSetting(key: string): Promise<any> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error getting system setting:', error)
      throw error
    }

    return data ? JSON.parse(data.value) : null
  }

  async getSystemSettings(): Promise<any[]> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')

    if (error) {
      console.error('Error getting system settings:', error)
      throw error
    }

    return data || []
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }

  try {
    const { pathname } = new URL(req.url)
    const settingsService = new SettingsService()

    // Provider endpoints
    if (pathname === '/api/providers' && req.method === 'GET') {
      const providers = await settingsService.getProviders()
      return new Response(JSON.stringify(providers), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    if (pathname === '/api/providers' && req.method === 'POST') {
      const provider = await req.json()
      const newProvider = await settingsService.createProvider(provider)
      return new Response(JSON.stringify(newProvider), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    if (pathname.startsWith('/api/providers/') && req.method === 'PUT') {
      const providerId = pathname.split('/').pop()
      if (!providerId) {
        return new Response(JSON.stringify({ error: 'Provider ID required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }

      const updates = await req.json()
      await settingsService.updateProvider(providerId, updates)
      return new Response(JSON.stringify({ status: 'updated' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    if (pathname.startsWith('/api/providers/') && req.method === 'DELETE') {
      const providerId = pathname.split('/').pop()
      if (!providerId) {
        return new Response(JSON.stringify({ error: 'Provider ID required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }

      await settingsService.deleteProvider(providerId)
      return new Response(JSON.stringify({ status: 'deleted' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // User settings endpoints
    if (pathname.startsWith('/api/settings/user/') && req.method === 'GET') {
      const parts = pathname.split('/')
      const userId = parts[4]
      const key = parts[5]
      
      if (!userId || !key) {
        return new Response(JSON.stringify({ error: 'User ID and key required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }

      const value = await settingsService.getUserSetting(userId, key)
      return new Response(JSON.stringify({ key, value }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    if (pathname.startsWith('/api/settings/user/') && req.method === 'POST') {
      const parts = pathname.split('/')
      const userId = parts[4]
      const key = parts[5]
      
      if (!userId || !key) {
        return new Response(JSON.stringify({ error: 'User ID and key required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }

      const { value } = await req.json()
      await settingsService.setUserSetting(userId, key, value)
      return new Response(JSON.stringify({ status: 'set' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    if (pathname.startsWith('/api/settings/user/') && req.method === 'DELETE') {
      const parts = pathname.split('/')
      const userId = parts[4]
      const key = parts[5]
      
      if (!userId || !key) {
        return new Response(JSON.stringify({ error: 'User ID and key required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }

      await settingsService.deleteUserSetting(userId, key)
      return new Response(JSON.stringify({ status: 'deleted' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // System settings endpoints
    if (pathname.startsWith('/api/settings/system/') && req.method === 'GET') {
      const key = pathname.split('/').pop()
      if (!key) {
        return new Response(JSON.stringify({ error: 'Key required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }

      const value = await settingsService.getSystemSetting(key)
      return new Response(JSON.stringify({ key, value }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    if (pathname.startsWith('/api/settings/system/') && req.method === 'POST') {
      const key = pathname.split('/').pop()
      if (!key) {
        return new Response(JSON.stringify({ error: 'Key required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }

      const { value } = await req.json()
      await settingsService.setSystemSetting(key, value)
      return new Response(JSON.stringify({ status: 'set' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('Error in settings function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}) 