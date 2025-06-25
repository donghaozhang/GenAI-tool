import React from 'react';
import Chat from '@/components/designer/chat/Chat';
import CanvasExcali from '@/components/designer/canvas/CanvasExcali';
import CanvasHeader from '@/components/designer/canvas/CanvasHeader';
import { Session } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Palette,
  MessageSquare,
  Layout,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfigs } from '@/contexts/ConfigsContext';

// Use native browser UUID generation
function generateUUID() {
  return crypto.randomUUID();
}

export const AIDesigner: React.FC = () => {
  const [chatCollapsed, setChatCollapsed] = React.useState(false);
  const [canvasCollapsed, setCanvasCollapsed] = React.useState(false);
  const [sessionList, setSessionList] = React.useState<Session[]>([]);
  const { canvasId: routeCanvasId } = useParams();
  
  // Generate stable canvas ID - only generate once and persist
  const [canvasId] = React.useState(() => routeCanvasId || generateUUID());
  
  const { setShowSettingsDialog } = useConfigs();
  const navigate = useNavigate();

  const toggleChat = () => {
    setChatCollapsed(!chatCollapsed);
    if (canvasCollapsed && !chatCollapsed) {
      setCanvasCollapsed(false);
    }
  };

  const toggleCanvas = () => {
    setCanvasCollapsed(!canvasCollapsed);
    if (chatCollapsed && !canvasCollapsed) {
      setChatCollapsed(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI Designer</h1>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/')}> 
              <Home className="w-4 h-4" /> 
              <span className="hidden lg:inline">Home</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/marketplace')}> 
              <Layout className="w-4 h-4" /> 
              <span className="hidden lg:inline">Marketplace</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/canvas')}> 
              <Palette className="w-4 h-4" /> 
              <span className="hidden lg:inline">Canvas</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/agent-studio')}> 
              <Settings className="w-4 h-4" /> 
              <span className="hidden lg:inline">Agents</span>
            </Button>
          </nav>
          
          {/* Mobile nav */}
          <nav className="flex md:hidden items-center gap-1">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('/')}> 
              <Home className="w-4 h-4" /> 
            </Button>
            <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('/marketplace')}> 
              <Layout className="w-4 h-4" /> 
            </Button>
            <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('/canvas')}> 
              <Palette className="w-4 h-4" /> 
            </Button>
            <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('/agent-studio')}> 
              <Settings className="w-4 h-4" /> 
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={chatCollapsed ? 'outline' : 'default'} size="sm" onClick={toggleChat} className="gap-2">
            <MessageSquare className="w-4 h-4" /> {chatCollapsed ? 'Show Chat' : 'Hide Chat'}
          </Button>
          <Button variant={canvasCollapsed ? 'outline' : 'default'} size="sm" onClick={toggleCanvas} className="gap-2">
            <Layout className="w-4 h-4" /> {canvasCollapsed ? 'Show Canvas' : 'Hide Canvas'}
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}> <Settings className="w-4 h-4" /> </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className={cn('transition-all duration-300 border-r border-gray-200 dark:border-gray-700', 
          chatCollapsed ? 'w-0' : 'w-full md:w-1/3 md:min-w-[300px] md:max-w-[500px]'
        )}>
          {!chatCollapsed && (
            <div className="h-full p-2 md:p-4"> 
              <Chat canvasId={canvasId} sessionList={sessionList} setSessionList={setSessionList} /> 
            </div>
          )}
        </div>
        {/* Resize Handle - Hidden on mobile */}
        {!chatCollapsed && !canvasCollapsed && <div className="hidden md:block w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-col-resize transition-colors" />}
        {/* Canvas Panel */}
        <div className={cn('flex-1 transition-all duration-300 flex flex-col', canvasCollapsed && 'w-0 overflow-hidden')}>
          {!canvasCollapsed && (
            <>
              <CanvasHeader 
                canvasId={canvasId} 
                canvasName="AI Canvas"
                onNameChange={() => {}}
                onNameSave={() => {}}
              />
              <div className="flex-1">
                <CanvasExcali canvasId={canvasId} />
              </div>
            </>
          )}
        </div>
        {/* Placeholder when both panels collapsed */}
        {chatCollapsed && canvasCollapsed && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Palette className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">AI Designer</h2>
              <p className="text-gray-500 mb-6 max-w-md">Create amazing designs with AI assistance. Show the chat to start conversing or show the canvas to begin designing.</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={toggleChat} className="gap-2"> <MessageSquare className="w-4 h-4" /> Show Chat </Button>
                <Button onClick={toggleCanvas} variant="outline" className="gap-2"> <Layout className="w-4 h-4" /> Show Canvas </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Status Bar */}
      <footer className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>AI Designer v1.0</span>
          <Separator orientation="vertical" className="h-3" />
          <span>Ready</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Layout: {chatCollapsed ? 'Canvas Only' : canvasCollapsed ? 'Chat Only' : 'Split View'}</span>
          <Separator orientation="vertical" className="h-3" />
          <span>Auto-save enabled</span>
        </div>
      </footer>
    </div>
  );
}; 