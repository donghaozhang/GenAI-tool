import { Message, Model } from '@/types/types'

const API_BASE_URL = import.meta.env.VITE_JAAZ_BACKEND_URL || 'http://localhost:8000'

export const getChatSession = async (sessionId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/chat_session/${sessionId}`)
  const data = await response.json()
  return data as Message[]
}

export const sendMessages = async (payload: {
  sessionId: string
  canvasId: string
  newMessages: Message[]
  textModel: Model
  imageModel: Model
  systemPrompt: string | null
}) => {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
  const data = await response.json()
  return data as Message[]
}

export const cancelChat = async (sessionId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/cancel/${sessionId}`, {
    method: 'POST',
  })
  return await response.json()
}
