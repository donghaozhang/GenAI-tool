import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Types for chat functionality
interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | any
  tool_calls?: any[]
}

interface ChatRequest {
  messages: ChatMessage[]
  session_id: string
  canvas_id?: string
  text_model: {
    model: string
    provider: string
  }
  image_model?: {
    model: string
    provider: string
  }
  system_prompt?: string
}

interface ChatResponse {
  status: string
  session_id?: string
  error?: string
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Database service for chat
class ChatDatabaseService {
  async createChatSession(
    sessionId: string, 
    model: string, 
    provider: string, 
    canvasId?: string, 
    title?: string
  ) {
    const { error } = await supabase
      .from('chat_sessions')
      .insert({
        id: sessionId,
        model,
        provider,
        canvas_id: canvasId,
        title: title || 'New Chat',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error creating chat session:', error)
      throw error
    }
  }

  async createMessage(sessionId: string, role: string, content: string) {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content,
        created_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error creating message:', error)
      throw error
    }
  }

  async getSessionMessages(sessionId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching messages:', error)
      throw error
    }
    
    return data || []
  }
}

// Chat service
class ChatService {
  private dbService = new ChatDatabaseService()

  async handleChat(data: ChatRequest): Promise<void> {
    const { messages, session_id, canvas_id, text_model, image_model, system_prompt } = data

    try {
      // Create new session if this is the first message
      if (messages.length === 1) {
        const prompt = messages[0].content
        const title = typeof prompt === 'string' ? prompt.substring(0, 200) : 'New Chat'
        await this.dbService.createChatSession(
          session_id, 
          text_model.model, 
          text_model.provider, 
          canvas_id, 
          title
        )
      }

      // Save the latest message
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1]
        await this.dbService.createMessage(
          session_id, 
          lastMessage.role, 
          JSON.stringify(lastMessage)
        )
      }

      // Process with AI (simplified for now - will be enhanced with LangGraph)
      await this.processWithAI(messages, session_id, text_model, system_prompt)

    } catch (error) {
      console.error('Error handling chat:', error)
      throw error
    }
  }

  private async processWithAI(
    messages: ChatMessage[], 
    sessionId: string, 
    textModel: any, 
    systemPrompt?: string
  ) {
    // TODO: Implement LangGraph integration
    // For now, we'll use a simple AI response
    
    const response = {
      role: 'assistant' as const,
      content: `I received your message. This is a placeholder response from the Jaaz chat system. Session: ${sessionId}`
    }

    // Save AI response
    await this.dbService.createMessage(sessionId, 'assistant', JSON.stringify(response))

    // TODO: Send WebSocket notification when done
    console.log(`Chat processing completed for session: ${sessionId}`)
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }

  try {
    const { pathname } = new URL(req.url)
    
    if (pathname === '/api/chat' && req.method === 'POST') {
      const data: ChatRequest = await req.json()
      const chatService = new ChatService()
      
      await chatService.handleChat(data)
      
      return new Response(JSON.stringify({ status: 'done' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    if (pathname.startsWith('/api/cancel/') && req.method === 'POST') {
      const sessionId = pathname.split('/').pop()
      
      // TODO: Implement task cancellation
      console.log(`Cancelling session: ${sessionId}`)
      
      return new Response(JSON.stringify({ status: 'cancelled' }), {
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
    console.error('Error in chat function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}) 