
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const models = [
  { id: 'flux-schnell', name: 'FLUX Schnell', description: 'Fast high-quality generation' },
  { id: 'flux-pro', name: 'FLUX Pro', description: 'Premium quality images' },
  { id: 'imagen4', name: 'Imagen 4', description: 'Google\'s latest model' },
  { id: 'kling-video', name: 'Kling Video', description: 'Image to video generation' },
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  const currentModel = models.find(model => model.id === selectedModel) || models[0];

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4">
      <h3 className="text-lg font-semibold text-white mb-3">Select AI Model</h3>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Model:</span>
          <span className="text-sm font-medium text-blue-400">{currentModel.name}</span>
        </div>
        
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
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="bg-gray-700 rounded p-3">
        <p className="text-sm text-gray-300">{currentModel.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">Model: {currentModel.name} selected</span>
        </div>
      </div>
    </div>
  );
};
