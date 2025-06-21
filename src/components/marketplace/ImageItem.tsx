import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check, Play } from 'lucide-react';

interface ImageItemProps {
  imageUrl: string;
  index: number;
  isSelected: boolean;
  onSelect: (url: string) => void;
  onDownload: (url: string, index: number) => void;
}

export const ImageItem: React.FC<ImageItemProps> = ({
  imageUrl,
  index,
  isSelected,
  onSelect,
  onDownload,
}) => {
  const handleClick = () => {
    onSelect(isSelected ? '' : imageUrl);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(imageUrl, index);
  };

  // Check if the URL is a video file - improved detection
  const isVideo = (() => {
    const url = imageUrl.toLowerCase();
    // Check for common video file extensions
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
    const hasVideoExtension = videoExtensions.some(ext => url.includes(ext));
    
    // Also check for video MIME type hints in URL or query parameters
    const hasVideoMimeHint = url.includes('video/') || url.includes('type=video');
    
    // Check if it's a blob URL that might contain video (common for generated content)
    const isBlobVideo = url.startsWith('blob:') && (hasVideoExtension || hasVideoMimeHint);
    
    return hasVideoExtension || hasVideoMimeHint || isBlobVideo;
  })();

  return (
    <div 
      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-500/50' 
          : 'border-gray-600 hover:border-gray-500'
      }`}
      onClick={handleClick}
    >
      <div className="aspect-square bg-gray-700 relative">
        {isVideo ? (
          <video
            src={imageUrl}
            className="w-full h-full object-cover"
            controls
            muted
            playsInline
            onError={(e) => {
              console.error('Generated video failed to load:', imageUrl);
            }}
          />
        ) : (
          <img
            src={imageUrl}
            alt={`Generated ${index + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Generated image failed to load:', imageUrl);
            }}
          />
        )}
        
        {/* Video play indicator */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 rounded-full p-3">
              <Play className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full p-1">
            <Check className="w-3 h-3" />
          </div>
        )}
        
        {/* Download button */}
        <Button
          onClick={handleDownload}
          size="sm"
          variant="secondary"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Download className="w-3 h-3" />
        </Button>
        
        {/* Media type indicator */}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {isVideo ? '🎥' : '🖼️'} #{index + 1}
        </div>
      </div>
    </div>
  );
};
