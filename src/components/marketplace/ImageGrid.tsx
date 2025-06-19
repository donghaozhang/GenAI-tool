
import React from 'react';
import { ImageItem } from './ImageItem';

interface ImageGridProps {
  imageUrls: string[];
  selectedImageUrl: string | null;
  onImageSelect: (url: string) => void;
  onImageDownload: (url: string, index: number) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  imageUrls,
  selectedImageUrl,
  onImageSelect,
  onImageDownload,
}) => {
  const getGridCols = () => {
    if (imageUrls.length === 1) return 'grid-cols-1';
    if (imageUrls.length === 2) return 'grid-cols-2';
    return 'grid-cols-2 md:grid-cols-3';
  };

  return (
    <div className={`grid gap-4 mb-4 ${getGridCols()}`}>
      {imageUrls.map((imageUrl, index) => (
        <ImageItem
          key={index}
          imageUrl={imageUrl}
          index={index}
          isSelected={selectedImageUrl === imageUrl}
          onSelect={onImageSelect}
          onDownload={onImageDownload}
        />
      ))}
    </div>
  );
};
