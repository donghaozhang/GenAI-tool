import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { featuredModels } from '@/constants/models';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  const currentModel = featuredModels.find(model => model.id === selectedModel) || featuredModels[0];

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
      case 'Video to Audio':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Select AI Model</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(currentModel.categoryLabel)}`}>
          {currentModel.categoryLabel}
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
              {featuredModels.map((model) => (
                <SelectItem 
                  key={model.id} 
                  value={model.id}
                  className="text-white hover:bg-gray-600"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <div className="font-medium">{model.title}</div>
                      <div className="text-xs text-gray-400">{model.description.slice(0, 60)}...</div>
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
      
      <div className="mt-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-green-400">Ready to generate with {currentModel.title}</span>
      </div>
    </div>
  );
};
