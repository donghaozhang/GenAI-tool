
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PromptChatAssistantProps {
  onPromptImproved: (improvedPrompt: string) => void;
  currentPrompt?: string;
}

export const PromptChatAssistant: React.FC<PromptChatAssistantProps> = ({
  onPromptImproved,
  currentPrompt = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: {
          message: inputMessage,
          context: currentPrompt ? `Current prompt: "${currentPrompt}"` : undefined
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get response from ChatGPT');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const extractPromptFromMessage = (content: string) => {
    // Simple extraction - look for quoted text or text after "improved prompt:"
    const quotedMatch = content.match(/"([^"]+)"/);
    if (quotedMatch) return quotedMatch[1];
    
    const improvedMatch = content.match(/improved prompt:?\s*(.+)/i);
    if (improvedMatch) return improvedMatch[1].trim();
    
    return content;
  };

  const useImprovedPrompt = (content: string) => {
    const extractedPrompt = extractPromptFromMessage(content);
    onPromptImproved(extractedPrompt);
    toast.success('Prompt applied!');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="bg-purple-600 border-purple-500 text-white hover:bg-purple-700 flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Improve with AI
      </Button>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700 mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            ChatGPT Prompt Assistant
          </CardTitle>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-60 overflow-y-auto bg-gray-900 rounded-lg p-3 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Ask ChatGPT to help improve your prompts!</p>
              <p className="text-xs mt-1">Try: "How can I make this prompt more detailed?"</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-100'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  {message.role === 'assistant' && (
                    <Button
                      onClick={() => useImprovedPrompt(message.content)}
                      size="sm"
                      variant="ghost"
                      className="mt-2 h-6 text-xs text-purple-400 hover:text-purple-300"
                    >
                      Use This Prompt
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 p-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask ChatGPT to improve your prompt..."
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
