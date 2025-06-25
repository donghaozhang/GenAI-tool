import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface AgentModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'local' | 'fal';
  type: 'chat' | 'image' | 'multimodal';
  endpoint?: string;
  maxTokens?: number;
  temperature?: number;
  enabled: boolean;
}

export interface AgentPrompt {
  id: string;
  name: string;
  content: string;
  category: 'creative' | 'technical' | 'business' | 'custom';
  tags: string[];
  isDefault: boolean;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
  isActive: boolean;
}

interface AgentStore {
  models: AgentModel[];
  prompts: AgentPrompt[];
  configs: AgentConfig[];
  activeConfigId: string | null;
  currentModel: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  isConnected: boolean;
  connectionError: string | null;
  
  addModel: (model: Omit<AgentModel, 'id'>) => void;
  updateModel: (id: string, updates: Partial<AgentModel>) => void;
  removeModel: (id: string) => void;
  setModelEnabled: (id: string, enabled: boolean) => void;
  addPrompt: (prompt: Omit<AgentPrompt, 'id'>) => void;
  updatePrompt: (id: string, updates: Partial<AgentPrompt>) => void;
  removePrompt: (id: string) => void;
  addConfig: (config: Omit<AgentConfig, 'id'>) => void;
  updateConfig: (id: string, updates: Partial<AgentConfig>) => void;
  removeConfig: (id: string) => void;
  setActiveConfig: (id: string) => void;
  setCurrentModel: (model: string) => void;
  setTemperature: (temperature: number) => void;
  setMaxTokens: (maxTokens: number) => void;
  setSystemPrompt: (prompt: string) => void;
  setConnectionStatus: (connected: boolean, error?: string) => void;
  testConnection: (modelId: string) => Promise<boolean>;
  initializeDefaults: () => void;
}

const defaultModels: AgentModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    type: 'chat',
    maxTokens: 4096,
    temperature: 0.7,
    enabled: true,
  },
  {
    id: 'flux-schnell',
    name: 'FLUX Schnell',
    provider: 'fal',
    type: 'image',
    enabled: true,
  },
];

const defaultPrompts: AgentPrompt[] = [
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    content: 'You are an expert creative designer with deep knowledge of visual aesthetics, typography, color theory, and modern design trends. Help users create stunning visual designs.',
    category: 'creative',
    tags: ['design', 'visual', 'creative'],
    isDefault: true,
  },
];

export const useAgentStore = create<AgentStore>()(
  subscribeWithSelector((set, get) => ({
    models: [],
    prompts: [],
    configs: [],
    activeConfigId: null,
    currentModel: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: defaultPrompts[0].content,
    isConnected: false,
    connectionError: null,
    
    addModel: (model) => {
      const newModel: AgentModel = { id: crypto.randomUUID(), ...model };
      set((state) => ({ models: [...state.models, newModel] }));
    },
    
    updateModel: (id: string, updates: Partial<AgentModel>) => {
      set((state) => ({
        models: state.models.map(m => m.id === id ? { ...m, ...updates } : m),
      }));
    },
    
    removeModel: (id: string) => {
      set((state) => ({ models: state.models.filter(m => m.id !== id) }));
    },
    
    setModelEnabled: (id: string, enabled: boolean) => {
      get().updateModel(id, { enabled });
    },
    
    addPrompt: (prompt) => {
      const newPrompt: AgentPrompt = { id: crypto.randomUUID(), ...prompt };
      set((state) => ({ prompts: [...state.prompts, newPrompt] }));
    },
    
    updatePrompt: (id: string, updates: Partial<AgentPrompt>) => {
      set((state) => ({
        prompts: state.prompts.map(p => p.id === id ? { ...p, ...updates } : p),
      }));
    },
    
    removePrompt: (id: string) => {
      set((state) => ({ prompts: state.prompts.filter(p => p.id !== id) }));
    },
    
    addConfig: (config) => {
      const newConfig: AgentConfig = { id: crypto.randomUUID(), ...config };
      set((state) => ({ configs: [...state.configs, newConfig] }));
    },
    
    updateConfig: (id: string, updates: Partial<AgentConfig>) => {
      set((state) => ({
        configs: state.configs.map(c => c.id === id ? { ...c, ...updates } : c),
      }));
    },
    
    removeConfig: (id: string) => {
      set((state) => ({ configs: state.configs.filter(c => c.id !== id) }));
    },
    
    setActiveConfig: (id: string) => {
      const config = get().configs.find(c => c.id === id);
      if (config) {
        set({
          activeConfigId: id,
          currentModel: config.model,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          systemPrompt: config.systemPrompt,
        });
      }
    },
    
    setCurrentModel: (model: string) => set({ currentModel: model }),
    setTemperature: (temperature: number) => set({ temperature }),
    setMaxTokens: (maxTokens: number) => set({ maxTokens }),
    setSystemPrompt: (prompt: string) => set({ systemPrompt: prompt }),
    
    setConnectionStatus: (connected: boolean, error?: string) => {
      set({ isConnected: connected, connectionError: error || null });
    },
    
    testConnection: async (modelId: string) => {
      const { setConnectionStatus } = get();
      try {
        setConnectionStatus(false, null);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConnectionStatus(true);
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Connection failed';
        setConnectionStatus(false, errorMessage);
        return false;
      }
    },
    
    initializeDefaults: () => {
      set({
        models: defaultModels,
        prompts: defaultPrompts,
        currentModel: defaultModels[0].id,
        systemPrompt: defaultPrompts[0].content,
      });
    },
  }))
); 