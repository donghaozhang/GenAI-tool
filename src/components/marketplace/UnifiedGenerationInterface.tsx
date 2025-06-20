import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Upload, Sparkles, Image, Video, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateImageWithModel } from '@/services/imageGeneration';
import { processImagePipeline } from '@/utils/pipelineProcessing';
import { featuredModels } from '@/constants/models';

interface UnifiedGenerationInterfaceProps {
  onImagesGenerated: (imageUrls: string[], prompt: string) => void;
  onFileUploaded: (file: File) => void;
}

// Map model categories to icons
const getModelIcon = (categoryLabel: string) => {
  switch (categoryLabel) {
    case 'Text to Image':
      return Image;
    case 'Image to Image':
      return Wand2;
    case 'Image to Video':
    case 'Text to Video':
      return Video;
    default:
      return Image;
  }
};

export const UnifiedGenerationInterface: React.FC<UnifiedGenerationInterfaceProps> = ({ 
  onImagesGenerated, 
  onFileUploaded 
}) => {
  const [selectedModel, setSelectedModel] = useState('fal-ai/imagen4/preview');
  const [prompt, setPrompt] = useState('');
  const [inputMethod, setInputMethod] = useState<'text' | 'upload'>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageCount, setImageCount] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState<string | null>(null);

  const currentModel = featuredModels.find(model => model.id === selectedModel) || featuredModels[0];
  const IconComponent = getModelIcon(currentModel.categoryLabel);

  // Update input method when model changes
  React.useEffect(() => {
    const requiresImageUpload = currentModel.categoryLabel === 'Image to Image' || currentModel.categoryLabel === 'Image to Video';
    if (requiresImageUpload) {
      setInputMethod('upload');
    } else {
      setInputMethod('text');
    }
  }, [currentModel.categoryLabel]);

  const getTypeColor = (categoryLabel: string) => {
    switch (categoryLabel) {
      case 'Text to Image':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Image to Image':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Image to Video':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Text to Video':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'Image to 3D':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleGenerate = async () => {
    if (inputMethod === 'text' && !prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (inputMethod === 'upload' && !uploadedFile) {
      toast.error('Please upload an image first');
      return;
    }

    setIsGenerating(true);
    try {
      const isTextToImage = currentModel.categoryLabel === 'Text to Image';
      
      if (isTextToImage) {
        // Use generateImageWithModel for text-to-image models
        console.log(`Generating ${imageCount} images with ${selectedModel}`);
        const imageUrls = await generateImageWithModel(selectedModel, prompt, imageCount);
        onImagesGenerated(imageUrls, prompt);
        toast.success(`Generated ${imageCount} image(s) successfully!`);
      } else {
        // Use processImagePipeline for image-to-image and image-to-video models
        if (!uploadedImageDataUrl) {
          toast.error('Please upload an image first');
          return;
        }
        
        console.log(`Processing pipeline with ${selectedModel}`);
        const outputUrl = await processImagePipeline(selectedModel, uploadedImageDataUrl, prompt);
        onImagesGenerated([outputUrl], prompt || 'Image transformation');
        toast.success('Image processing completed successfully!');
      }
    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to generate: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      onFileUploaded(file);
      
      // Convert file to data URL for pipeline processing
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedImageDataUrl(dataUrl);
        // Also show the uploaded image in the display
        onImagesGenerated([dataUrl], `Uploaded: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInputPlaceholder = () => {
    switch (currentModel.categoryLabel) {
      case 'Text to Image':
        return 'Describe the image you want to generate...';
      case 'Image to Image':
        return 'Describe how you want to transform the uploaded image...';
      case 'Image to Video':
        return 'Describe the video motion you want to create...';
      case 'Text to Video':
        return 'Describe the video you want to create...';
      default:
        return 'Enter your prompt...';
    }
  };

  const requiresImageUpload = currentModel.categoryLabel === 'Image to Image' || currentModel.categoryLabel === 'Image to Video';
  const canGenerate = inputMethod === 'text' ? prompt.trim() : uploadedFile !== null;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <IconComponent className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">AI Generation Studio</h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(currentModel.categoryLabel)}`}>
          {currentModel.categoryLabel}
        </div>
      </div>

      {/* Model Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            AI Model
          </label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Choose a model" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {featuredModels.map((model) => (
                <SelectItem 
                  key={model.id} 
                  value={model.id}
                  className="text-white hover:bg-gray-600"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <div className="font-medium">{model.title}</div>
                      <div className="text-xs text-gray-400">{model.description.slice(0, 50)}...</div>
                    </div>
                    <div className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${getTypeColor(model.categoryLabel)}`}>
                      {model.categoryLabel}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300 text-sm">
            {currentModel.description}
          </div>
        </div>
      </div>

      {/* Input Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Input Method
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => setInputMethod('text')}
            disabled={requiresImageUpload}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              inputMethod === 'text'
                ? 'bg-blue-600 border-blue-500 text-white'
                : requiresImageUpload
                ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Text Prompt
          </button>
          
          <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
            inputMethod === 'upload'
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
          }`}>
            <Upload className="w-4 h-4" />
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="file-input"
              onClick={() => setInputMethod('upload')}
            />
          </label>
        </div>
      </div>

      {/* Show uploaded file info */}
      {uploadedFile && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-green-400">
            <Upload className="w-4 h-4" />
            <span className="text-sm">Uploaded: {uploadedFile.name}</span>
          </div>
        </div>
      )}

      {/* Text Input */}
      {(inputMethod === 'text' || (requiresImageUpload && uploadedFile)) && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {requiresImageUpload ? 'Transformation Prompt' : 'Prompt'}
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={getInputPlaceholder()}
            className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-[100px] resize-none"
          />
        </div>
      )}

      {/* Generation Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Number of Images
          </label>
          <Select value={imageCount.toString()} onValueChange={(value) => setImageCount(parseInt(value))}>
            <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {[1, 2, 3, 4].map((num) => (
                <SelectItem key={num} value={num.toString()} className="text-white hover:bg-gray-600">
                  {num} image{num > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !canGenerate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {requiresImageUpload ? 'Transform' : 'Generate'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full animate-pulse ${canGenerate ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
        <span className={`text-xs ${canGenerate ? 'text-green-400' : 'text-yellow-400'}`}>
          {canGenerate 
            ? `Ready to generate with ${currentModel.title} • ${currentModel.categoryLabel}`
            : requiresImageUpload 
            ? 'Upload an image to continue'
            : 'Enter a prompt to continue'
          }
        </span>
      </div>

      {/* Quick Tips */}
      <div className="mt-4 p-3 bg-gray-700/50 rounded border border-gray-600">
        <p className="text-xs text-gray-400">
          <strong>Tip:</strong> {
            currentModel.categoryLabel === 'Text to Image' 
              ? 'Be descriptive in your prompts for better results'
              : currentModel.categoryLabel === 'Image to Image'
              ? 'Upload an image first, then describe the transformation'
              : currentModel.categoryLabel === 'Image to Video'
              ? 'Upload an image and describe the motion you want to create'
              : currentModel.categoryLabel === 'Text to Video'
              ? 'Describe the video scene and action you want to create'
              : 'Follow the model-specific guidelines for best results'
          }
        </p>
      </div>
    </div>
  );
}; 