import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Upload, Sparkles, Image, Video, Wand2, Layers, X } from 'lucide-react';
import { toast } from 'sonner';
import { generateImageWithModel, generateImagesBatch, BatchGenerationResult } from '@/services/imageGeneration';
import { processImagePipeline } from '@/utils/pipelineProcessing';
import { featuredModels } from '@/constants/models';
import { ModelSelector } from './ModelSelector';
import { BatchResultsDisplay } from './BatchResultsDisplay';

interface UnifiedGenerationInterfaceProps {
  onImagesGenerated: (imageUrls: string[], prompt: string) => void;
  onFileUploaded: (file: File) => void;
  onBatchResults?: (results: BatchGenerationResult[]) => void;
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
  onFileUploaded,
  onBatchResults
}) => {
  const [selectedModel, setSelectedModel] = useState('fal-ai/imagen4/preview');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [inputMethod, setInputMethod] = useState<'text' | 'upload'>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageCount, setImageCount] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<BatchGenerationResult[]>([]);

  const currentModel = featuredModels.find(model => model.id === selectedModel) || featuredModels[0];
  const IconComponent = getModelIcon(currentModel.categoryLabel);

  // Update input method when model changes (only in single mode)
  React.useEffect(() => {
    if (!batchMode) {
      const requiresImageUpload = currentModel.categoryLabel === 'Image to Image' || 
                                 currentModel.categoryLabel === 'Image to Video' ||
                                 currentModel.categoryLabel === 'Video to Video';
      if (requiresImageUpload) {
        setInputMethod('upload');
      } else {
        setInputMethod('text');
      }
    }
  }, [currentModel.categoryLabel, batchMode]);

  // Reset batch results when switching modes
  React.useEffect(() => {
    if (!batchMode) {
      setBatchResults([]);
    }
  }, [batchMode]);

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
      case 'Video to Video':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Video to Audio':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
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

    if (batchMode && selectedModels.length === 0) {
      toast.error('Please select at least one model for batch processing');
      return;
    }

    if (batchMode && batchRequiresImage && !uploadedFile) {
      // Check if MMAudio v2 is selected for more specific error message
      const hasMMAudio = selectedModels.some(modelId => modelId.includes('mmaudio-v2'));
      if (hasMMAudio) {
        toast.error('MMAudio V2 requires a video file to generate synchronized audio - please upload a video');
      } else {
        toast.error('Please upload an image - some selected models require image input');
      }
      return;
    }

    setIsGenerating(true);
    try {
      if (batchMode) {
        // Batch mode - generate with multiple models
        console.log(`Starting batch generation with ${selectedModels.length} models`);
        // Convert model IDs to model objects with categoryLabel
        const modelObjects = selectedModels.map(modelId => {
          const model = featuredModels.find(m => m.id === modelId);
          return {
            id: modelId,
            categoryLabel: model?.categoryLabel || 'Text to Image'
          };
        });
        const results = await generateImagesBatch(modelObjects, prompt, imageCount, uploadedImageDataUrl || undefined);
        setBatchResults(results);
        onBatchResults?.(results);
        
        const successCount = results.filter(r => r.success).length;
        const totalImages = results.reduce((sum, r) => sum + (r.imageUrls?.length || 0), 0);
        
        if (successCount > 0) {
          toast.success(`Batch completed: ${successCount}/${selectedModels.length} models successful, ${totalImages} images generated`);
          
          // Also add all successful images to the main display
          const allImages = results.flatMap(r => r.imageUrls || []);
          if (allImages.length > 0) {
            onImagesGenerated(allImages, `Batch: ${prompt}`);
          }
        } else {
          toast.error('Batch generation failed for all models');
        }
      } else {
        // Single mode - existing logic
        const isTextToImage = currentModel.categoryLabel === 'Text to Image';
        
        if (isTextToImage) {
          // Use generateImageWithModel for text-to-image models
          console.log(`Generating ${imageCount} images with ${selectedModel}`);
          const imageUrls = await generateImageWithModel(selectedModel, prompt, imageCount);
          onImagesGenerated(imageUrls, prompt);
          toast.success(`Generated ${imageCount} image(s) successfully!`);
        } else {
          // Use processImagePipeline for image-to-image, image-to-video, and video-to-video models
          if (!uploadedImageDataUrl) {
            const mediaType = currentModel.categoryLabel === 'Video to Video' ? 'video' : 'image';
            // Provide specific error message for MMAudio v2
            if (selectedModel.includes('mmaudio-v2')) {
              toast.error('MMAudio V2 requires a video file to generate synchronized audio');
            } else {
              toast.error(`Please upload a ${mediaType} first`);
            }
            return;
          }
          
          console.log(`Processing pipeline with ${selectedModel}`);
          const outputUrl = await processImagePipeline(selectedModel, uploadedImageDataUrl, prompt);
          const transformationType = currentModel.categoryLabel === 'Video to Video' ? 'Video enhancement' : 'Image transformation';
          onImagesGenerated([outputUrl], prompt || transformationType);
          toast.success('Processing completed successfully!');
        }
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
        // Don't add uploaded files to the generated images display
        // They will be shown in the upload confirmation area instead
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
      case 'Video to Video':
        return 'Describe the audio or enhancement you want to add...';
      default:
        return 'Enter your prompt...';
    }
  };

  const requiresImageUpload = !batchMode && (currentModel.categoryLabel === 'Image to Image' || 
                                         currentModel.categoryLabel === 'Image to Video' ||
                                         currentModel.categoryLabel === 'Video to Video');
  
  // Check if batch mode includes models that require image input
  const batchRequiresImage = batchMode && selectedModels.some(modelId => {
    const model = featuredModels.find(m => m.id === modelId);
    return model?.categoryLabel === 'Image to Video' || 
           model?.categoryLabel === 'Image to Image' ||
           model?.categoryLabel === 'Video to Video';
  });
  
  const canGenerate = batchMode 
    ? selectedModels.length > 0 && prompt.trim() && (!batchRequiresImage || uploadedFile !== null)
    : inputMethod === 'text' ? prompt.trim() : uploadedFile !== null;

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {batchMode ? (
              <Layers className="w-6 h-6 text-purple-400" />
            ) : (
              <IconComponent className="w-6 h-6 text-blue-400" />
            )}
            <h2 className="text-xl font-bold text-white">
              {batchMode ? 'Batch Generation Studio' : 'AI Generation Studio'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Batch Mode Toggle */}
            <div className="flex items-center gap-2">
              <label htmlFor="batch-mode" className="text-sm font-medium text-gray-300">
                Batch Mode
              </label>
              <Switch
                id="batch-mode"
                checked={batchMode}
                onCheckedChange={setBatchMode}
              />
            </div>
            {!batchMode && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(currentModel.categoryLabel)}`}>
                {currentModel.categoryLabel}
              </div>
            )}
          </div>
        </div>

        {/* Model Selection */}
        {batchMode ? (
          <div className="mb-6">
            <ModelSelector
              multiSelect={true}
              selectedModels={selectedModels}
              onModelsChange={setSelectedModels}
              maxSelection={6}
            />
          </div>
        ) : (
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
        )}

        {/* Input Method Selection - Only show in single mode */}
        {!batchMode && (
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
                {currentModel.categoryLabel === 'Video to Video' ? 'Upload Video' : 'Upload Image'}
                <input
                  type="file"
                  accept={currentModel.categoryLabel === 'Video to Video' ? "video/*" : "image/*"}
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="file-input"
                  onClick={() => setInputMethod('upload')}
                />
              </label>
            </div>
          </div>
        )}

      {/* Show uploaded file info */}
      {uploadedFile && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-green-400">
            <Upload className="w-4 h-4" />
            <span className="text-sm">
              {batchMode 
                ? `Uploaded: ${uploadedFile.name}`
                : `${currentModel.categoryLabel === 'Video to Video' ? 'Video' : 'Image'} Uploaded: ${uploadedFile.name}`
              }
            </span>
          </div>
        </div>
      )}

        {/* Media Upload for Batch Mode - Show if any selected model requires media input */}
        {batchMode && selectedModels.some(modelId => {
          const model = featuredModels.find(m => m.id === modelId);
          return model?.categoryLabel === 'Image to Video' || 
                 model?.categoryLabel === 'Image to Image' ||
                 model?.categoryLabel === 'Video to Video';
        }) && (
          <div className="mb-6">
            {(() => {
              const hasVideoToVideo = selectedModels.some(modelId => {
                const model = featuredModels.find(m => m.id === modelId);
                return model?.categoryLabel === 'Video to Video';
              });
              const hasImageModels = selectedModels.some(modelId => {
                const model = featuredModels.find(m => m.id === modelId);
                return model?.categoryLabel === 'Image to Video' || model?.categoryLabel === 'Image to Image';
              });
              
              return (
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  {hasVideoToVideo && hasImageModels ? 'Media Upload' : hasVideoToVideo ? 'Video Upload' : 'Image Upload'}
                  <span className="text-purple-400 ml-1">
                    (required for {hasVideoToVideo && hasImageModels ? 'selected models' : hasVideoToVideo ? 'Video-to-Video models' : 'Image-to-Video and Image-to-Image models'})
                  </span>
                </label>
              );
            })()}
            <div className="flex gap-4">
              <label className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                uploadedFile 
                  ? 'bg-green-600/20 border-green-500 text-green-400 hover:bg-green-600/30' 
                  : 'bg-purple-600/10 border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:border-purple-400'
              }`}>
                <Upload className="w-5 h-5" />
                <div className="flex flex-col">
                  {(() => {
                    const hasVideoToVideo = selectedModels.some(modelId => {
                      const model = featuredModels.find(m => m.id === modelId);
                      return model?.categoryLabel === 'Video to Video';
                    });
                    const hasImageModels = selectedModels.some(modelId => {
                      const model = featuredModels.find(m => m.id === modelId);
                      return model?.categoryLabel === 'Image to Video' || model?.categoryLabel === 'Image to Image';
                    });
                    
                    return (
                      <>
                        <span className="font-medium">
                          {uploadedFile 
                            ? hasVideoToVideo && hasImageModels ? 'Media Uploaded' : hasVideoToVideo ? 'Video Uploaded' : 'Image Uploaded'
                            : hasVideoToVideo && hasImageModels ? 'Upload Media' : hasVideoToVideo ? 'Upload Video' : 'Upload Image'
                          }
                        </span>
                        <span className="text-xs opacity-75">
                          {uploadedFile 
                            ? uploadedFile.name 
                            : hasVideoToVideo && hasImageModels ? 'Click to select image or video file' : hasVideoToVideo ? 'Click to select video file' : 'Click to select image file'
                          }
                        </span>
                      </>
                    );
                  })()}
                </div>
                <input
                  type="file"
                  accept={(() => {
                    const hasVideoToVideo = selectedModels.some(modelId => {
                      const model = featuredModels.find(m => m.id === modelId);
                      return model?.categoryLabel === 'Video to Video';
                    });
                    const hasImageModels = selectedModels.some(modelId => {
                      const model = featuredModels.find(m => m.id === modelId);
                      return model?.categoryLabel === 'Image to Video' || model?.categoryLabel === 'Image to Image';
                    });
                    
                    if (hasVideoToVideo && hasImageModels) {
                      return "image/*,video/*";
                    } else if (hasVideoToVideo) {
                      return "video/*";
                    } else {
                      return "image/*";
                    }
                  })()}
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="batch-file-input"
                />
              </label>
              
              {uploadedFile && (
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setUploadedImageDataUrl(null);
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Remove uploaded file"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
          </div>
        )}

        {/* Text Input */}
        {(batchMode || inputMethod === 'text' || (requiresImageUpload && uploadedFile)) && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {batchMode 
                ? 'Batch Prompt (will be used for all selected models)'
                : requiresImageUpload 
                ? 'Transformation Prompt' 
                : 'Prompt'
              }
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={batchMode 
                ? 'Enter a prompt that will be used for all selected models...'
                : getInputPlaceholder()
              }
              className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-[100px] resize-none"
            />
          </div>
        )}

        {/* Generation Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {batchMode 
                ? 'Outputs per Model' 
                : currentModel.categoryLabel === 'Video to Video' 
                ? 'Number of Videos'
                : currentModel.categoryLabel === 'Image to Video'
                ? 'Number of Videos'
                : 'Number of Images'
              }
            </label>
            <Select value={imageCount.toString()} onValueChange={(value) => setImageCount(parseInt(value))}>
              <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {[1, 2, 3, 4].map((num) => (
                  <SelectItem key={num} value={num.toString()} className="text-white hover:bg-gray-600">
                    {num} {
                      batchMode 
                        ? `output${num > 1 ? 's' : ''} per model`
                        : currentModel.categoryLabel === 'Video to Video' 
                        ? `video${num > 1 ? 's' : ''}`
                        : currentModel.categoryLabel === 'Image to Video'
                        ? `video${num > 1 ? 's' : ''}`
                        : `image${num > 1 ? 's' : ''}`
                    }
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !canGenerate}
              className={`w-full text-white disabled:opacity-50 ${
                batchMode 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {batchMode ? 'Processing Batch...' : 'Generating...'}
                </>
              ) : (
                <>
                  {batchMode ? (
                    <Layers className="w-4 h-4 mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {batchMode 
                    ? `Generate with ${selectedModels.length} Model${selectedModels.length > 1 ? 's' : ''}`
                    : requiresImageUpload 
                    ? 'Transform' 
                    : 'Generate'
                  }
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
              ? batchMode
                ? `Ready for batch generation with ${selectedModels.length} model${selectedModels.length > 1 ? 's' : ''}`
                : `Ready to generate with ${currentModel.title} • ${currentModel.categoryLabel}`
              : batchMode
              ? selectedModels.length === 0
                ? 'Select models for batch processing'
                : 'Enter a prompt to continue'
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
              batchMode
                ? 'Batch mode runs the same prompt across multiple models in parallel for easy comparison. Select up to 6 models for optimal performance.'
                : currentModel.categoryLabel === 'Text to Image' 
                ? 'Be descriptive in your prompts for better results'
                : currentModel.categoryLabel === 'Image to Image'
                ? 'Upload an image first, then describe the transformation'
                : currentModel.categoryLabel === 'Image to Video'
                ? 'Upload an image and describe the motion you want to create'
                : currentModel.categoryLabel === 'Video to Video'
                ? 'Upload a video and describe the audio or enhancement you want to add'
                : currentModel.categoryLabel === 'Text to Video'
                ? 'Describe the video scene and action you want to create'
                : 'Follow the model-specific guidelines for best results'
            }
          </p>
        </div>
      </div>

      {/* Batch Results Display */}
      {batchMode && (
        <BatchResultsDisplay
          results={batchResults}
          isGenerating={isGenerating}
          onImageClick={(imageUrl, modelTitle) => {
            // Could add modal or expanded view here
            console.log('Image clicked:', imageUrl, 'from', modelTitle);
          }}
        />
      )}
    </>
  );
}; 