import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Upload, X, Image, Type } from 'lucide-react';

interface ImageUploadSectionProps {
  uploadedImageUrl: string | null;
  setUploadedImageUrl: (url: string | null) => void;
  isUploading: boolean;
  setIsUploading: (loading: boolean) => void;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  uploadedImageUrl,
  setUploadedImageUrl,
  isUploading,
  setIsUploading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select a valid image or video file');
      return;
    }

    // Validate file size (max 50MB for videos, 10MB for images)
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeLimit = file.type.startsWith('video/') ? '50MB' : '10MB';
      toast.error(`File size must be less than ${sizeLimit}`);
      return;
    }

    setIsUploading(true);
    try {
      // Create a data URL for preview and API compatibility
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImageUrl(e.target?.result as string);
        toast.success('File uploaded successfully! (Ready for pipeline processing)');
      };
      reader.onerror = () => {
        console.error('Error reading file');
        toast.error('Failed to read file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      setIsUploading(false);
    }
  };

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleImageUpload(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;
    
    const file = files[0];
    await handleImageUpload(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveUploadedImage = () => {
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // If image is uploaded, show the compact preview
  if (uploadedImageUrl) {
    return (
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">Source Media</label>
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="outline"
            className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Change File
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Change uploaded image or video file"
        />
        
        <div className="mt-3 space-y-2">
          <div className="relative rounded-lg overflow-hidden bg-gray-600">
            {uploadedImageUrl.startsWith('data:video/') ? (
              <video
                src={uploadedImageUrl}
                controls
                className="w-full h-32 object-cover"
                muted
              />
            ) : (
              <img
                src={uploadedImageUrl}
                alt="Uploaded media"
                className="w-full h-32 object-cover"
              />
            )}
            <Button
              onClick={handleRemoveUploadedImage}
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-600 rounded text-sm">
            <span className="text-green-400">✓ Custom media uploaded</span>
          </div>
        </div>
      </div>
    );
  }

  // Initial state - show large drag and drop area
  return (
    <div className="mb-6">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-400 bg-blue-400/10'
            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800/70'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Upload image or video file"
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gray-700 rounded-full">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">
              Upload Media or Use Text Prompt
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Drag and drop an image/video here, or click to browse
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Image className="w-4 h-4 mr-2" />
              )}
              Choose File
            </Button>
            
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>or</span>
            </div>
            
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <Type className="w-4 h-4" />
              <span>Use text prompt below</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Supports images (PNG, JPG, GIF) up to 10MB and videos (MP4, MOV) up to 50MB
          </p>
        </div>

        {isDragOver && (
          <div className="absolute inset-0 bg-blue-400/20 border-2 border-blue-400 rounded-xl flex items-center justify-center">
            <div className="text-blue-300 font-medium">Drop your file here</div>
          </div>
        )}
      </div>
    </div>
  );
};
