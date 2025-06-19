
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateImageWithModel } from '../../services/imageGeneration';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { PromptChatAssistant } from './PromptChatAssistant';

interface PromptInputProps {
  onImagesGenerated: (imageUrls: string[], prompt: string) => void;
  selectedModel: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onImagesGenerated, selectedModel }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageCount, setImageCount] = useState(4);

  const getModelDisplayName = (modelId: string) => {
    const modelMap: { [key: string]: string } = {
      'flux-schnell': 'FLUX Schnell',
      'flux-pro': 'FLUX Pro',
      'imagen4': 'Imagen 4',
      'kling-video': 'Kling Video'
    };
    return modelMap[modelId] || modelId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      toast.info(`Generating ${imageCount} images with ${getModelDisplayName(selectedModel)}...`);
      const imageUrls = await generateImageWithModel(selectedModel, prompt, imageCount);
      console.log('Generated image URLs:', imageUrls);
      onImagesGenerated(imageUrls, prompt);
      toast.success(`${imageUrls.length} images generated successfully!`);
      setPrompt('');
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptImproved = (improvedPrompt: string) => {
    setPrompt(improvedPrompt);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Generate Custom Images</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-sm text-blue-400">Using: {getModelDisplayName(selectedModel)}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt to generate images..."
          className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          disabled={isGenerating}
        />
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Count:</label>
            <select
              value={imageCount}
              onChange={(e) => setImageCount(Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              disabled={isGenerating}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={6}>6</option>
            </select>
          </div>
          
          <Button 
            type="submit" 
            disabled={!prompt.trim() || isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>

          <PromptChatAssistant 
            onPromptImproved={handlePromptImproved}
            currentPrompt={prompt}
          />
        </div>
      </form>
    </div>
  );
};
