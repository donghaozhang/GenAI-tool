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
import { useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { useConfigs } from '@/contexts/ConfigsContext';

export const AIDesigner: React.FC = () => {
  const [chatCollapsed, setChatCollapsed] = React.useState(false);
  const [canvasCollapsed, setCanvasCollapsed] = React.useState(false);
  const [sessionList, setSessionList] = React.useState<Session[]>([]);
  const { canvasId: routeCanvasId } = useParams();
  const canvasId = routeCanvasId || nanoid();
  const { setShowSettingsDialog } = useConfigs();

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

          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => (window.location.href = '/')}> <Home className="w-4 h-4" /> Home </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => (window.location.href = '/ai-marketplace')}> <Layout className="w-4 h-4" /> Marketplace </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => (window.location.href = '/canvas')}> <Palette className="w-4 h-4" /> Canvas </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => (window.location.href = '/agent-studio')}> <Settings className="w-4 h-4" /> Agents </Button>
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
        <div className={cn('transition-all duration-300 border-r border-gray-200 dark:border-gray-700', chatCollapsed ? 'w-0' : 'w-1/3 min-w-[300px] max-w-[500px]')}>{!chatCollapsed && (<div className="h-full p-4"> <Chat canvasId={canvasId} sessionList={sessionList} setSessionList={setSessionList} /> </div>)}</div>
        {/* Resize Handle */}
        {!chatCollapsed && !canvasCollapsed && <div className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-col-resize transition-colors" />}
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