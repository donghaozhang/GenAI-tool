import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const models = [
  { id: 'fal-ai/flux/schnell', name: 'FLUX Schnell', description: 'Fast high-quality generation', type: 'Text to Image' },
  { id: 'fal-ai/flux-pro', name: 'FLUX Pro', description: 'Premium quality images', type: 'Text to Image' },
  { id: 'fal-ai/imagen-4-preview', name: 'Imagen 4', description: 'Google\'s latest model', type: 'Text to Image' },
  { id: 'fal-ai/kling-video/v2.1/standard/image-to-video', name: 'Kling Video', description: 'Image to video generation', type: 'Image to Video' },
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  const currentModel = models.find(model => model.id === selectedModel) || models[0];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Text to Image':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Image to Video':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Image to Image':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Text to Video':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Select AI Model</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(currentModel.type)}`}>
          {currentModel.type}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Model
          </label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Choose a model" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {models.map((model) => (
                <SelectItem 
                  key={model.id} 
                  value={model.id}
                  className="text-white hover:bg-gray-600"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{model.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{model.type}</span>
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
      
      <div className="mt-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-green-400">Ready to generate with {currentModel.name}</span>
      </div>
    </div>
  );
};
