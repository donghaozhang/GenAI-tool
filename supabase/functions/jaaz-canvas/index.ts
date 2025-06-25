import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Types for canvas functionality
interface CanvasData {
  id: string
  title: string
  data: any
  user_id?: string
  created_at?: string
  updated_at?: string
}

interface CanvasRequest {
  title?: string
  data?: any
  user_id?: string
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Canvas service
class CanvasService {
  async createCanvas(data: CanvasRequest): Promise<CanvasData> {
    const canvasData = {
      id: crypto.randomUUID(),
      title: data.title || 'Untitled Canvas',
      data: data.data || {},
      user_id: data.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('canvases')
      .insert(canvasData)

    if (error) {
      console.error('Error creating canvas:', error)
      throw error
    }

    return canvasData
  }

  async getCanvas(canvasId: string): Promise<CanvasData | null> {
    const { data, error } = await supabase
      .from('canvases')
      .select('*')
      .eq('id', canvasId)
      .single()

    if (error) {
      console.error('Error fetching canvas:', error)
      throw error
    }

    return data
  }

  async updateCanvas(canvasId: string, updates: Partial<CanvasData>): Promise<void> {
    const { error } = await supabase
      .from('canvases')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', canvasId)

    if (error) {
      console.error('Error updating canvas:', error)
      throw error
    }
  }

  async deleteCanvas(canvasId: string): Promise<void> {
    const { error } = await supabase
      .from('canvases')
      .delete()
      .eq('id', canvasId)

    if (error) {
      console.error('Error deleting canvas:', error)
      throw error
    }
  }

  async listCanvases(userId?: string): Promise<CanvasData[]> {
    let query = supabase
      .from('canvases')
      .select('*')
      .order('updated_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error listing canvases:', error)
      throw error
    }

    return data || []
  }

  async exportCanvas(canvasId: string, format: 'png' | 'svg' | 'json' = 'png'): Promise<any> {
    const canvas = await this.getCanvas(canvasId)
    if (!canvas) {
      throw new Error('Canvas not found')
    }

    // TODO: Implement actual export logic based on format
    switch (format) {
      case 'json':
        return {
          format: 'json',
          data: canvas.data,
          metadata: {
            id: canvas.id,
            title: canvas.title,
            created_at: canvas.created_at,
            updated_at: canvas.updated_at
          }
        }
      case 'png':
      case 'svg':
        // TODO: Implement image export using canvas data
        return {
          format,
          data: canvas.data,
          message: `${format.toUpperCase()} export not yet implemented`
        }
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
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
    const canvasService = new CanvasService()

    // Create canvas
    if (pathname === '/api/canvas' && req.method === 'POST') {
      const data: CanvasRequest = await req.json()
      const canvas = await canvasService.createCanvas(data)
      
      return new Response(JSON.stringify(canvas), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // Get canvas by ID
    if (pathname.startsWith('/api/canvas/') && req.method === 'GET') {
      const canvasId = pathname.split('/').pop()
      if (!canvasId) {
        return new Response(JSON.stringify({ error: 'Canvas ID required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }

      const canvas = await canvasService.getCanvas(canvasId)
      if (!canvas) {
        return new Response(JSON.stringify({ error: 'Canvas not found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }

      return new Response(JSON.stringify(canvas), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // Update canvas
    if (pathname.startsWith('/api/canvas/') && req.method === 'PUT') {
      const canvasId = pathname.split('/').pop()
      if (!canvasId) {
        return new Response(JSON.stringify({ error: 'Canvas ID required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }

      const updates = await req.json()
      await canvasService.updateCanvas(canvasId, updates)
      
      return new Response(JSON.stringify({ status: 'updated' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // Delete canvas
    if (pathname.startsWith('/api/canvas/') && req.method === 'DELETE') {
      const canvasId = pathname.split('/').pop()
      if (!canvasId) {
        return new Response(JSON.stringify({ error: 'Canvas ID required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }

      await canvasService.deleteCanvas(canvasId)
      
      return new Response(JSON.stringify({ status: 'deleted' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // List canvases
    if (pathname === '/api/canvases' && req.method === 'GET') {
      const url = new URL(req.url)
      const userId = url.searchParams.get('user_id')
      const canvases = await canvasService.listCanvases(userId || undefined)
      
      return new Response(JSON.stringify(canvases), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // Export canvas
    if (pathname.startsWith('/api/canvas/') && pathname.includes('/export') && req.method === 'GET') {
      const parts = pathname.split('/')
      const canvasId = parts[3]
      const format = parts[5] as 'png' | 'svg' | 'json' || 'png'
      
      if (!canvasId) {
        return new Response(JSON.stringify({ error: 'Canvas ID required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }

      const exportData = await canvasService.exportCanvas(canvasId, format)
      
      return new Response(JSON.stringify(exportData), {
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
    console.error('Error in canvas function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}) 