
import React, { useState } from 'react';
import { ImagePipeline } from './ImagePipeline';
import { ImageGrid } from './ImageGrid';
import { PipelineToggle } from './PipelineToggle';
import { downloadImage } from '@/utils/imageDownloader';

interface MultiImageDisplayProps {
  images: string[];
  prompt?: string;
}

export const MultiImageDisplay: React.FC<MultiImageDisplayProps> = ({ images, prompt }) => {
  const [showPipeline, setShowPipeline] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl || null);
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

      {!selectedImageUrl && images.length > 1 && (
        <p className="text-sm text-gray-400 mb-3">
          Click on an image to select it for pipeline processing
        </p>
      )}
      
      <ImageGrid
        imageUrls={images}
        selectedImageUrl={selectedImageUrl}
        onImageSelect={handleImageSelect}
        onImageDownload={handleImageDownload}
      />

      {showPipeline && selectedImageUrl && (
        <ImagePipeline 
          sourceImageUrl={selectedImageUrl} 
          sourcePrompt={prompt}
        />
      )}
    </div>
  );
};
