import React, { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { ImageUploadSection } from './ImageUploadSection';
import { ImageDisplayGrid } from './ImageDisplayGrid';
import { PipelineControls } from './PipelineControls';
import { pipelineModels } from '@/constants/models';
import { processBackgroundRemoval } from '@/utils/backgroundRemoval';
import { processImagePipeline } from '@/utils/pipelineProcessing';
import { processVideoToSound } from '@/utils/elevenLabsProcessing';

interface ImagePipelineProps {
  sourceImageUrl?: string;
  sourcePrompt?: string;
}

export const ImagePipeline: React.FC<ImagePipelineProps> = ({ sourceImageUrl, sourcePrompt }) => {
  const [selectedPipelineModel, setSelectedPipelineModel] = useState('');
  const [pipelinePrompt, setPipelinePrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const currentSourceImage = uploadedImageUrl || sourceImageUrl;

  const handleUseResultAsInput = () => {
    if (pipelineResult) {
      setUploadedImageUrl(pipelineResult);
      setPipelineResult(null);
      setSelectedPipelineModel('');
      setPipelinePrompt('');
      toast.success('Pipeline result is now set as input image!');
    }
  };

  const handlePipelineProcess = async () => {
    if (!selectedPipelineModel || isProcessing) return;

    const selectedModel = pipelineModels.find(m => m.id === selectedPipelineModel);
    
    // Check if we need a source image for this model type
    const isTextToVideo = selectedModel?.type === 'text-to-video';
    if (!isTextToVideo && !currentSourceImage) {
      toast.error('Please upload an image or generate one first');
      return;
    }

    setIsProcessing(true);
    try {
      toast.info(`Processing with ${selectedModel?.name}...`);
      
      let result: string;
      
      if (selectedPipelineModel === 'fal-ai/imageutils/rembg') {
        result = await processBackgroundRemoval(currentSourceImage!);
      } else if (selectedPipelineModel === 'video-to-sound') {
        result = await processVideoToSound(currentSourceImage!);
      } else {
        // For text-to-video models, we don't pass the source image
        result = await processImagePipeline(
          selectedPipelineModel, 
          isTextToVideo ? undefined : currentSourceImage, 
          pipelinePrompt
        );
      }
      
      setPipelineResult(result);
      toast.success(`${selectedModel?.name} processing completed!`);
    } catch (error) {
      console.error('Pipeline processing error:', error);
      
      // Extract error message for better user feedback
      let errorMessage = 'Pipeline processing failed. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('Source image URL is required')) {
          errorMessage = 'Please upload an image first before running the pipeline.';
        } else if (error.message.includes('Unsupported model')) {
          errorMessage = 'This model is not currently supported. Please try a different model.';
        } else if (error.message.includes('FAL_API_KEY')) {
          errorMessage = 'API configuration error. Please contact support.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error occurred. Please try again in a moment.';
        } else {
          errorMessage = `Pipeline error: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedModel = pipelineModels.find(m => m.id === selectedPipelineModel);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-white">AI Pipeline</h3>
        <ArrowRight className="w-4 h-4 text-blue-400" />
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>

      <ImageUploadSection
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
      />

      <ImageDisplayGrid
        currentSourceImage={currentSourceImage}
        uploadedImageUrl={uploadedImageUrl}
        pipelineResult={pipelineResult}
        isProcessing={isProcessing}
        selectedModel={selectedModel}
        onUseResultAsInput={handleUseResultAsInput}
      />

      <PipelineControls
        selectedPipelineModel={selectedPipelineModel}
        setSelectedPipelineModel={setSelectedPipelineModel}
        pipelinePrompt={pipelinePrompt}
        setPipelinePrompt={setPipelinePrompt}
        isProcessing={isProcessing}
        currentSourceImage={currentSourceImage}
        onPipelineProcess={handlePipelineProcess}
      />
    </div>
  );
};
