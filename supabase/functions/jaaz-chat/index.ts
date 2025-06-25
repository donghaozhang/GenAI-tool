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
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database service for chat
class ChatDatabaseService {
  async createChatSession(
    sessionId: string, 
    model: string, 
    provider: string, 
    canvasId?: string, 
    title?: string,
    userId?: string
  ) {
    // For development, allow null userId for anonymous sessions
    const finalUserId = userId || null
    
    console.log('💾 Creating chat session:', { sessionId, model, provider, canvasId, title, userId: finalUserId })
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        id: sessionId, // Expecting a UUID string
        model,
        provider,
        canvas_id: canvasId,
        user_id: finalUserId,
        title: title || 'New Chat',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (error) {
      console.error('❌ Error creating chat session:', error)
      throw error
    }
    
    console.log('✅ Chat session created:', data)
  }

  async createMessage(sessionId: string, role: string, content: string) {
    console.log('💾 Creating message:', { sessionId, role, content })
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content,
        created_at: new Date().toISOString()
      })
      .select()
    
    if (error) {
      console.error('❌ Error creating message:', error)
      throw error
    }
    
    console.log('✅ Message created:', data)
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

  async getAllChatSessions() {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching chat sessions:', error)
      throw error
    }
    
    return data || []
  }
}

// Chat service
class ChatService {
  public dbService = new ChatDatabaseService()

  async handleChat(data: ChatRequest): Promise<ChatMessage[]> {
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

      // Process with AI and get response
      const aiResponse = await this.processWithAI(messages, session_id, text_model, system_prompt)

      // Return all messages including the new AI response
      const allMessages = await this.dbService.getSessionMessages(session_id)
      return allMessages

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
    console.log('📍 Incoming request path:', pathname, 'Method:', req.method)
    
    // Remove function name prefix from pathname for routing
    const routePath = pathname.replace('/jaaz-chat', '') || '/'
    console.log('🛤️ Route path:', routePath)
    
    if (routePath === '/api/chat' && req.method === 'POST') {
      const data: ChatRequest = await req.json()
      console.log('📥 Received chat request:', data)
      
      try {
        const chatService = new ChatService()
        
        const messages = await chatService.handleChat(data)
        
        return new Response(JSON.stringify(messages), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      } catch (error) {
        console.error('💥 Chat service error:', error)
        return new Response(JSON.stringify({ 
          error: 'Chat processing failed', 
          details: error.message,
          stack: error.stack 
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }
    }
    
    if (routePath.startsWith('/api/chat_session/') && req.method === 'GET') {
      const sessionId = routePath.split('/').pop()
      const chatService = new ChatService()
      
      const messages = await chatService.dbService.getSessionMessages(sessionId!)
      
      return new Response(JSON.stringify(messages), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    if (routePath === '/api/chat_sessions' && req.method === 'GET') {
      const chatService = new ChatService()
      
      const sessions = await chatService.dbService.getAllChatSessions()
      
      return new Response(JSON.stringify(sessions), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    if (routePath.startsWith('/api/cancel/') && req.method === 'POST') {
      const sessionId = routePath.split('/').pop()
      
      // TODO: Implement task cancellation
      console.log(`Cancelling session: ${sessionId}`)
      
      return new Response(JSON.stringify({ status: 'cancelled' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    return new Response(JSON.stringify({ 
      error: 'Not found', 
      debug: {
        pathname,
        routePath,
        method: req.method,
        url: req.url,
        message: 'Available routes: POST /api/chat, GET /api/chat_session/{id}, POST /api/cancel/{id}'
      }
    }), {
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