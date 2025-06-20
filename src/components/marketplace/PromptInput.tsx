import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { generateImageWithModel } from '../../services/imageGeneration';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';

interface PromptInputProps {
  onImagesGenerated: (imageUrls: string[], prompt: string) => void;
  selectedModel: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onImagesGenerated, selectedModel }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageCount, setImageCount] = useState(1);

  const modelDisplayNames: { [key: string]: string } = {
    'fal-ai/flux/schnell': 'FLUX Schnell',
    'fal-ai/flux-pro': 'FLUX Pro',
    'fal-ai/imagen4/preview': 'Imagen 4',
    'fal-ai/kling-video/v2.1/standard/image-to-video': 'Kling Video',
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      toast.info(`Generating ${imageCount} image${imageCount > 1 ? 's' : ''} with ${modelDisplayNames[selectedModel] || selectedModel}...`);
      const imageUrls = await generateImageWithModel(selectedModel, prompt, imageCount);
      onImagesGenerated(imageUrls, prompt);
      toast.success(`Generated ${imageUrls.length} image${imageUrls.length > 1 ? 's' : ''} successfully!`);
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleGenerate();
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Generate Images</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Prompt
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the image you want to generate..."
            className="min-h-[100px] bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
            disabled={isGenerating}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="image-count" className="text-sm text-gray-300">Images:</label>
            <select
              id="image-count"
              value={imageCount}
              onChange={(e) => setImageCount(Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
              disabled={isGenerating}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
          
          <div className="flex-1" />
          
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-gray-400">
          Press Ctrl+Enter to generate • Using {modelDisplayNames[selectedModel] || selectedModel}
        </p>
      </div>
    </div>
  );
};
