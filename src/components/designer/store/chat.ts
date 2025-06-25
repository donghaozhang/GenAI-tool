import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  images?: string[];
  metadata?: {
    model?: string;
    tokens?: number;
    error?: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatStore {
  // Current chat state
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  
  // Selected model for AI responses
  selectedModel: string;
  
  // Actions
  createSession: (title?: string) => ChatSession;
  selectSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (messageId: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedModel: (model: string) => void;
  
  // Generate AI response
  generateResponse: (userMessage: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector((set, get) => ({
    currentSession: null,
    sessions: [],
    isLoading: false,
    isTyping: false,
    error: null,
    selectedModel: 'gpt-4',
    
    createSession: (title = 'New Chat') => {
      const newSession: ChatSession = {
        id: crypto.randomUUID(),
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      set((state) => ({
        sessions: [newSession, ...state.sessions],
        currentSession: newSession,
      }));
      
      return newSession;
    },
    
    selectSession: (sessionId: string) => {
      const session = get().sessions.find(s => s.id === sessionId);
      if (session) {
        set({ currentSession: session });
      }
    },
    
    deleteSession: (sessionId: string) => {
      set((state) => {
        const newSessions = state.sessions.filter(s => s.id !== sessionId);
        const newCurrentSession = state.currentSession?.id === sessionId 
          ? newSessions[0] || null 
          : state.currentSession;
        
        return {
          sessions: newSessions,
          currentSession: newCurrentSession,
        };
      });
    },
    
    addMessage: (message) => {
      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ...message,
      };
      
      set((state) => {
        if (!state.currentSession) return state;
        
        const updatedSession = {
          ...state.currentSession,
          messages: [...state.currentSession.messages, newMessage],
          updatedAt: new Date(),
        };
        
        return {
          currentSession: updatedSession,
          sessions: state.sessions.map(s => 
            s.id === updatedSession.id ? updatedSession : s
          ),
        };
      });
    },
    
    updateMessage: (messageId: string, updates: Partial<ChatMessage>) => {
      set((state) => {
        if (!state.currentSession) return state;
        
        const updatedSession = {
          ...state.currentSession,
          messages: state.currentSession.messages.map(m =>
            m.id === messageId ? { ...m, ...updates } : m
          ),
          updatedAt: new Date(),
        };
        
        return {
          currentSession: updatedSession,
          sessions: state.sessions.map(s => 
            s.id === updatedSession.id ? updatedSession : s
          ),
        };
      });
    },
    
    deleteMessage: (messageId: string) => {
      set((state) => {
        if (!state.currentSession) return state;
        
        const updatedSession = {
          ...state.currentSession,
          messages: state.currentSession.messages.filter(m => m.id !== messageId),
          updatedAt: new Date(),
        };
        
        return {
          currentSession: updatedSession,
          sessions: state.sessions.map(s => 
            s.id === updatedSession.id ? updatedSession : s
          ),
        };
      });
    },
    
    clearMessages: () => {
      set((state) => {
        if (!state.currentSession) return state;
        
        const updatedSession = {
          ...state.currentSession,
          messages: [],
          updatedAt: new Date(),
        };
        
        return {
          currentSession: updatedSession,
          sessions: state.sessions.map(s => 
            s.id === updatedSession.id ? updatedSession : s
          ),
        };
      });
    },
    
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setTyping: (typing: boolean) => set({ isTyping: typing }),
    setError: (error: string | null) => set({ error }),
    setSelectedModel: (model: string) => set({ selectedModel: model }),
    
    generateResponse: async (userMessage: string) => {
      const { addMessage, setLoading, setTyping, setError, selectedModel } = get();

      // Immediately add the user message
      addMessage({ role: 'user', content: userMessage });

      setLoading(true);
      setTyping(true);
      setError(null);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, model: selectedModel }),
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);

        const data = await res.json();
        const aiContent = data.content || data.answer || 'Sorry, no response';

        addMessage({
          role: 'assistant',
          content: aiContent,
          metadata: { model: selectedModel },
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? 'Failed to get AI response');
      } finally {
        setLoading(false);
        setTyping(false);
      }
    },
  }))
); 