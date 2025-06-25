import { Message, Model } from '@/types/types'
import { config } from '@/config/env'

// Use Supabase Edge Functions instead of direct backend
const API_BASE_URL = config.supabase.functionsUrl

export const getChatSession = async (sessionId: string) => {
  try {
    console.log(`🔍 Loading chat session: ${sessionId}`)
    console.log(`📡 API URL: ${API_BASE_URL}/jaaz-chat/api/chat_session/${sessionId}`)
    
    const response = await fetch(`${API_BASE_URL}/jaaz-chat/api/chat_session/${sessionId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabase.anonKey}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`✅ Chat session loaded:`, data)
    return data as Message[]
  } catch (error) {
    console.error(`❌ Failed to load chat session ${sessionId}:`, error)
    throw error
  }
}

export const sendMessages = async (payload: {
  sessionId: string
  canvasId: string
  newMessages: Message[]
  textModel: Model
  imageModel: Model
  systemPrompt: string | null
}) => {
  try {
    console.log(`💬 Sending messages to session: ${payload.sessionId}`)
    console.log(`📡 API URL: ${API_BASE_URL}/jaaz-chat/api/chat`)
    console.log(`📝 Payload:`, payload)
    
    const response = await fetch(`${API_BASE_URL}/jaaz-chat/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabase.anonKey}`,
      },
      body: JSON.stringify({
        messages: payload.newMessages,
        canvas_id: payload.canvasId,
        session_id: payload.sessionId,
        text_model: payload.textModel,
        image_model: payload.imageModel,
        system_prompt: payload.systemPrompt,
      }),
    })
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        console.error('🔍 Server error details:', errorData)
        errorMessage = errorData.details || errorData.error || errorMessage
      } catch (e) {
        // If we can't parse the error response, use the original message
      }
      throw new Error(errorMessage)
    }
    
    const data = await response.json()
    console.log(`✅ Messages sent successfully:`, data)
    return data as Message[]
  } catch (error) {
    console.error(`❌ Failed to send messages:`, error)
    throw error
  }
}

export const cancelChat = async (sessionId: string) => {
  try {
    console.log(`🛑 Canceling chat session: ${sessionId}`)
    
    const response = await fetch(`${API_BASE_URL}/jaaz-chat/api/cancel/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabase.anonKey}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`❌ Failed to cancel chat session ${sessionId}:`, error)
    throw error
  }
}
