import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCcw, Grid3X3, Move } from 'lucide-react';

export const Canvas: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1));
  const handleResetView = () => setZoom(1);
  const toggleGrid = () => setShowGrid(prev => !prev);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Canvas</CardTitle>
          <Badge variant="outline" className="text-xs">{Math.round(zoom * 100)}%</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button onClick={handleZoomOut} size="sm" variant="outline" className="h-7 px-2">
            <ZoomOut className="w-3 h-3" />
          </Button>
          <Button onClick={handleZoomIn} size="sm" variant="outline" className="h-7 px-2">
            <ZoomIn className="w-3 h-3" />
          </Button>
          <Button onClick={handleResetView} size="sm" variant="outline" className="h-7 px-2">
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button onClick={toggleGrid} size="sm" variant={showGrid ? "default" : "outline"} className="h-7 px-2">
            <Grid3X3 className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative overflow-hidden">
        <div 
          className="w-full h-full relative"
          style={{
            backgroundImage: showGrid ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)` : 'none',
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Move className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Design Canvas</h3>
              <p className="text-sm">Generate images in the chat and drag them here to start designing</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 