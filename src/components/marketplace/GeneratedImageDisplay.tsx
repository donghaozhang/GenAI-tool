
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePipeline } from './ImagePipeline';
import { ChevronDown, ChevronUp, Workflow } from 'lucide-react';

interface GeneratedImageDisplayProps {
  imageUrl: string | null;
  prompt?: string;
}

export const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ imageUrl, prompt }) => {
  const [showPipeline, setShowPipeline] = useState(false);

  if (!imageUrl) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Generated Image</h3>
        <Button
          onClick={() => setShowPipeline(!showPipeline)}
          variant="outline"
          size="sm"
          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
        >
          <Workflow className="w-4 h-4 mr-2" />
          {showPipeline ? 'Hide' : 'Show'} Pipeline
          {showPipeline ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </Button>
      </div>
      
      <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden relative mb-4">
        <img
          src={imageUrl}
          alt="Generated from prompt"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Generated image failed to load:', imageUrl);
          }}
        />
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
          AI Generated
        </div>
      </div>

      {showPipeline && (
        <ImagePipeline 
          sourceImageUrl={imageUrl} 
          sourcePrompt={prompt}
        />
      )}
    </div>
  );
};
