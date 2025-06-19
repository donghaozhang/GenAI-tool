
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Image } from 'lucide-react';

interface ImageUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  onFileSelect,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <Button
        onClick={handleButtonClick}
        disabled={disabled}
        variant="outline"
        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Upload Image/Video
      </Button>
    </>
  );
};
