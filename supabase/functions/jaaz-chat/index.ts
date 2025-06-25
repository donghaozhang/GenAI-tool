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
  /**
   * Atomically create a chat session with the first message in a single transaction
   */
  async createSessionWithFirstMessage(
    sessionId: string,
    model: string,
    provider: string,
    role: string,
    content: string,
    canvasId?: string,
    title?: string,
    userId?: string
  ) {
    const finalUserId = userId || null
    const finalTitle = title || 'New Chat'
    
    console.log('💾 Creating session with first message atomically:', {
      sessionId, model, provider, canvasId, title: finalTitle, userId: finalUserId, role, content
    })
    
    // Use the database function for atomic creation
    const { data, error } = await supabase
      .rpc('create_session_with_first_message', {
        p_session_id: sessionId,
        p_model: model,
        p_provider: provider,
        p_canvas_id: canvasId || null,
        p_title: finalTitle,
        p_user_id: finalUserId,
        p_message_role: role,
        p_message_content: content
      })
    
    if (error) {
      console.error('❌ Error creating session with first message:', error)
      throw error
    }
    
    console.log('✅ Session and first message created atomically:', data)
    return data
  }

  /**
   * Create a standalone chat session (for existing session reuse)
   */
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

  /**
   * Create a message for an existing session
   */
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

  /**
   * Check if a session exists
   */
  async sessionExists(sessionId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking session existence:', error)
      throw error
    }
    
    return !!data
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
    
    // Return messages as-is since content is now stored as plain text
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
      // Check if this is a new session or continuation
      const sessionExists = await this.dbService.sessionExists(session_id)
      
      if (!sessionExists && messages.length > 0) {
        // New session - create session and first message atomically
        const firstMessage = messages[0]
        const prompt = firstMessage.content
        const title = typeof prompt === 'string' ? prompt.substring(0, 200) : 'New Chat'
        const messageContent = typeof firstMessage.content === 'string' 
          ? firstMessage.content 
          : JSON.stringify(firstMessage.content)
        
        await this.dbService.createSessionWithFirstMessage(
          session_id,
          text_model.model,
          text_model.provider,
          firstMessage.role,
          messageContent,
          canvas_id,
          title
        )
        
        // Save any additional messages if there are more than one
        for (let i = 1; i < messages.length; i++) {
          const msg = messages[i]
          const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
          await this.dbService.createMessage(session_id, msg.role, content)
        }
      } else if (sessionExists) {
        // Existing session - just save the latest message(s)
        for (const message of messages) {
          const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
          await this.dbService.createMessage(session_id, message.role, content)
        }
      } else {
        throw new Error('No messages provided for new session')
      }

      // Process with AI and get response
      await this.processWithAI(messages, session_id, text_model, system_prompt)

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
    try {
      // Get OpenRouter API key from environment
      const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
      
      if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY not found in environment variables')
      }

      // Prepare messages for OpenRouter API
      const apiMessages = messages.map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      }))

      // Add system prompt if provided
      if (systemPrompt) {
        apiMessages.unshift({ role: 'system', content: systemPrompt })
      }

      console.log('🤖 Calling OpenRouter API with model:', textModel.model)
      console.log('📤 API Messages:', apiMessages)

      // Call OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://your-app-domain.com',
          'X-Title': 'Jaaz AI Designer'
        },
        body: JSON.stringify({
          model: textModel.model || 'openai/gpt-4o-mini',
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 2000,
          tools: [
            {
              type: 'function',
              function: {
                name: 'generate_image',
                description: 'Generate an image based on a detailed prompt',
                parameters: {
                  type: 'object',
                  properties: {
                    prompt: {
                      type: 'string',
                      description: 'Detailed image generation prompt'
                    },
                    style: {
                      type: 'string',
                      description: 'Art style or aesthetic direction'
                    }
                  },
                  required: ['prompt']
                }
              }
            }
          ],
          tool_choice: 'auto'
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ OpenRouter API error:', response.status, errorText)
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const aiContent = data.choices[0].message.content

      console.log('✅ AI response received:', aiContent)

      // Create AI response message
      const aiResponse = {
        role: 'assistant' as const,
        content: aiContent
      }

      // Save AI response to database
      await this.dbService.createMessage(sessionId, 'assistant', aiContent)

      console.log(`✅ Chat processing completed for session: ${sessionId}`)
      return aiResponse

    } catch (error) {
      console.error('❌ Error in processWithAI:', error)
      
      // Create error response
      const errorResponse = {
        role: 'assistant' as const,
        content: `I apologize, but I encountered an error processing your request. Please try again. Error: ${error.message}`
      }

      // Save error response to database
      await this.dbService.createMessage(sessionId, 'assistant', errorResponse.content)
      
      return errorResponse
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
          stack: error.stack,
          received_data: data
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