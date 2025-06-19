
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check } from 'lucide-react';

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
        <img
          src={imageUrl}
          alt={`Generated ${index + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Generated image failed to load:', imageUrl);
          }}
        />
        
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
        
        {/* Image number */}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          #{index + 1}
        </div>
      </div>
    </div>
  );
};
