import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Play } from 'lucide-react';
import { pipelineModels, PipelineModel } from '@/constants/models';
import { Textarea } from '../ui/textarea';

interface PipelineControlsProps {
  selectedPipelineModel: string;
  setSelectedPipelineModel: (model: string) => void;
  pipelinePrompt: string;
  setPipelinePrompt: (prompt: string) => void;
  isProcessing: boolean;
  currentSourceImage: string | null;
  onPipelineProcess: () => void;
}

// Helper function to get type badge color
const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'text-to-image':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'image-to-image':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'image-to-video':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'text-to-video':
      return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    case 'image-to-3d':
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'video-to-audio':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export const PipelineControls: React.FC<PipelineControlsProps> = ({
  selectedPipelineModel,
  setSelectedPipelineModel,
  pipelinePrompt,
  setPipelinePrompt,
  isProcessing,
  currentSourceImage,
  onPipelineProcess,
}) => {
  const selectedModel = pipelineModels.find(m => m.id === selectedPipelineModel);

  // Text-to-video models don't require a source image
  const isTextToVideo = selectedModel?.type === 'text-to-video';
  const canProcess = selectedPipelineModel && (isTextToVideo || currentSourceImage);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Select Pipeline Model</label>
        <Select value={selectedPipelineModel} onValueChange={setSelectedPipelineModel}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Choose pipeline model">
              {selectedModel && (
                <div>
                  <div className="font-medium">{selectedModel.name}</div>
                  <div className="text-xs text-gray-400">{selectedModel.typeLabel}</div>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            {pipelineModels.map((model) => (
              <SelectItem 
                key={model.id} 
                value={model.id}
                className="text-white hover:bg-gray-600"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-gray-400">{model.description}</div>
                  </div>
                  <div className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${getTypeBadgeColor(model.type)}`}>
                    {model.typeLabel}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedModel && (
        <div className="bg-gray-700 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={`px-2 py-1 rounded text-xs font-medium border ${getTypeBadgeColor(selectedModel.type)}`}>
              {selectedModel.typeLabel}
            </div>
          </div>
          <p className="text-sm text-gray-300">{selectedModel.description}</p>
          {selectedModel.id === 'fal-ai/flux-pro/kontext' && (
            <p className="text-xs text-yellow-400 mt-1">
              ✨ Advanced context-aware image modification and enhancement
            </p>
          )}
          {selectedModel.id === 'fal-ai/imageutils/rembg' && (
            <p className="text-xs text-blue-400 mt-1">
              🎯 Automatically removes background using advanced AI segmentation with rembg
            </p>
          )}
          {selectedModel.id === 'fal-ai/aura-sr' && (
            <p className="text-xs text-green-400 mt-1">
              🚀 AI-powered super-resolution for enhanced image quality and upscaling
            </p>
          )}
          {selectedModel.id === 'video-to-sound' && (
            <p className="text-xs text-orange-400 mt-1">
              🎵 Generate realistic sound effects from video content using ElevenLabs AI
            </p>
          )}
          {selectedModel.id === 'fal-ai/bytedance/seedance/v1/lite/text-to-video' && (
            <p className="text-xs text-pink-400 mt-1">
              🎬 Generate high-quality videos from text descriptions using SeeeDance AI
            </p>
          )}
          {selectedModel.id === 'fal-ai/hunyuan3d-v21' && (
            <p className="text-xs text-cyan-400 mt-1">
              🎮 Generate detailed 3D models from 2D images using advanced AI
            </p>
          )}
        </div>
      )}

      {selectedModel?.id !== 'fal-ai/imageutils/rembg' && selectedModel?.id !== 'fal-ai/aura-sr' && selectedModel?.id !== 'video-to-sound' && (
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Pipeline Prompt</label>
          <input
            type="text"
            value={pipelinePrompt}
            onChange={(e) => setPipelinePrompt(e.target.value)}
            placeholder={
              selectedModel?.id === 'fal-ai/flux-pro/kontext' 
                ? "Describe how you want to modify the image..." 
                : selectedModel?.id === 'fal-ai/bytedance/seedance/v1/lite/text-to-video'
                ? "Describe the video you want to create..."
                : selectedModel?.id === 'fal-ai/hunyuan3d-v21'
                ? "Describe the 3D model characteristics..."
                : "Add instructions for the pipeline process..."
            }
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
          />
        </div>
      )}

      {isTextToVideo && !currentSourceImage && (
        <div className="bg-blue-700/20 border border-blue-600 rounded p-3">
          <p className="text-xs text-blue-300">
            💡 This model generates video from text only - no input image required
          </p>
        </div>
      )}

      <Button
        onClick={onPipelineProcess}
        disabled={!canProcess || isProcessing}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Pipeline...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Run Pipeline
          </>
        )}
      </Button>
    </div>
  );
};
