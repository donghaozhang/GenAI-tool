import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/chat';
import { useAgentStore } from '../store/agent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const MessageItem: React.FC<{ message: any }> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn("flex gap-3 p-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", isUser ? "bg-blue-600" : "bg-gray-700")}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={cn("flex-1 max-w-[80%]", isUser ? "text-right" : "text-left")}>
        <div className={cn("inline-block p-3 rounded-lg", isUser ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100")}>
          <p className="text-sm">{message.content}</p>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          {message.metadata?.model && <Badge variant="outline" className="text-xs">{message.metadata.model}</Badge>}
        </div>
      </div>
    </div>
  );
};

const ChatInput: React.FC = () => {
  const [input, setInput] = React.useState('');
  const { generateResponse, isLoading } = useChatStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    await generateResponse(message);
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe what you want to create..." disabled={isLoading} className="flex-1" />
      <Button type="submit" disabled={!input.trim() || isLoading} size="sm">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </Button>
    </form>
  );
};

export const Chat: React.FC = () => {
  const { currentSession, isTyping, error, createSession } = useChatStore();
  const { initializeDefaults, models } = useAgentStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (models.length === 0) initializeDefaults();
    if (!currentSession) createSession('Welcome Chat');
  }, [models.length, currentSession, initializeDefaults, createSession]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);
  
  if (!currentSession) {
    return <Card className="h-full flex items-center justify-center"><CardContent><p className="text-gray-500">Loading chat...</p></CardContent></Card>;
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1">
          {currentSession.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Welcome to AI Designer</h3>
                <p className="text-gray-500 max-w-sm">Start a conversation to create amazing designs with AI assistance.</p>
              </div>
            </div>
          ) : (
            <div>
              {currentSession.messages.map((message) => <MessageItem key={message.id} message={message} />)}
              {isTyping && (
                <div className="flex gap-3 p-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        {error && (
          <div className="p-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        <ChatInput />
      </CardContent>
    </Card>
  );
}; 