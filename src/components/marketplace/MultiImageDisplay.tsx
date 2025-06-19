import React, { useState } from 'react';
import { ImagePipeline } from './ImagePipeline';
import { ImageGrid } from './ImageGrid';
import { PipelineToggle } from './PipelineToggle';
import { downloadImage } from '@/utils/imageDownloader';
import { ArrowDown } from 'lucide-react';

interface MultiImageDisplayProps {
  images: string[];
  prompt?: string;
}

export const MultiImageDisplay: React.FC<MultiImageDisplayProps> = ({ images, prompt }) => {
  const [showPipeline, setShowPipeline] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  const handleImageSelect = (imageUrl: string) => {
    const newSelection = imageUrl || null;
    setSelectedImageUrl(newSelection);
    
    // Auto-show pipeline when an image is selected (if not already visible)
    if (newSelection && !showPipeline) {
      setShowPipeline(true);
    }
  };

  const handleImageDownload = (imageUrl: string, index: number) => {
    downloadImage(imageUrl, index);
  };

  const handleTogglePipeline = () => {
    setShowPipeline(!showPipeline);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Generated Images ({images.length})
        </h3>
        <PipelineToggle
          showPipeline={showPipeline}
          onToggle={handleTogglePipeline}
          disabled={!selectedImageUrl}
        />
      </div>

      {/* Selection guidance */}
      {!selectedImageUrl && images.length > 1 && (
        <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-300 flex items-center gap-2">
            <span>💡</span>
            <strong>Select an image below</strong> to use it in the AI pipeline for further processing
          </p>
        </div>
      )}

      {/* Selected image indicator */}
      {selectedImageUrl && (
        <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-300 flex items-center gap-2">
            <span>✅</span>
            <strong>Image selected!</strong> {showPipeline ? 'Configure the pipeline below to transform your image.' : 'Click "Show Pipeline" to start processing.'}
          </p>
        </div>
      )}
      
      <ImageGrid
        imageUrls={images}
        selectedImageUrl={selectedImageUrl}
        onImageSelect={handleImageSelect}
        onImageDownload={handleImageDownload}
      />

      {/* Pipeline indicator */}
      {showPipeline && selectedImageUrl && (
        <div className="flex items-center justify-center py-2">
          <ArrowDown className="w-5 h-5 text-blue-400 animate-bounce" />
        </div>
      )}

      {/* Pipeline component */}
      {showPipeline && selectedImageUrl && (
        <div className="mt-4">
          <ImagePipeline 
            sourceImageUrl={selectedImageUrl} 
            sourcePrompt={prompt}
          />
        </div>
      )}

      {/* No selection state for pipeline toggle */}
      {showPipeline && !selectedImageUrl && (
        <div className="mt-4 bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
          <p className="text-yellow-300 text-center">
            ⚠️ Please select an image above to use the AI pipeline
          </p>
        </div>
      )}
    </div>
  );
};
