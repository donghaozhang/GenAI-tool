import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { featuredModels } from '@/constants/models';

interface ModelSelectorProps {
  selectedModel?: string;
  selectedModels?: string[];
  onModelChange?: (model: string) => void;
  onModelsChange?: (models: string[]) => void;
  multiSelect?: boolean;
  maxSelection?: number;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  selectedModels = [],
  onModelChange, 
  onModelsChange,
  multiSelect = false,
  maxSelection = 6
}) => {
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

  const handleModelToggle = (modelId: string, checked: boolean) => {
    if (!onModelsChange) return;
    
    let newSelection: string[];
    if (checked) {
      if (selectedModels.length >= maxSelection) {
        return; // Don't add if at max
      }
      newSelection = [...selectedModels, modelId];
    } else {
      newSelection = selectedModels.filter(id => id !== modelId);
    }
    onModelsChange(newSelection);
  };

  if (multiSelect) {
    // Multi-select mode with checkboxes
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Select AI Models</h2>
          <div className="text-sm text-gray-400">
            {selectedModels.length}/{maxSelection} selected
          </div>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {featuredModels.map((model) => {
            const isSelected = selectedModels.includes(model.id);
            const isDisabled = !isSelected && selectedModels.length >= maxSelection;
            
            return (
              <div 
                key={model.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  isSelected 
                    ? 'bg-blue-500/10 border-blue-500/30' 
                    : isDisabled
                    ? 'bg-gray-700/50 border-gray-600/50 opacity-50'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600/50'
                }`}
              >
                <Checkbox
                  id={model.id}
                  checked={isSelected}
                  disabled={isDisabled}
                  onCheckedChange={(checked) => handleModelToggle(model.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <label 
                    htmlFor={model.id} 
                    className={`block font-medium cursor-pointer ${
                      isDisabled ? 'text-gray-500' : 'text-white'
                    }`}
                  >
                    {model.title}
                  </label>
                  <p className={`text-xs mt-1 ${
                    isDisabled ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {model.description.slice(0, 80)}...
                  </p>
                  <div className={`mt-2 px-2 py-1 rounded text-xs font-medium border inline-block ${getTypeColor(model.categoryLabel)}`}>
                    {model.categoryLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {selectedModels.length > 0 && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400 font-medium mb-2">Selected Models:</p>
            <div className="flex flex-wrap gap-2">
              {selectedModels.map(modelId => {
                const model = featuredModels.find(m => m.id === modelId);
                return (
                  <span 
                    key={modelId}
                    className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs border border-blue-500/30"
                  >
                    {model?.title || modelId}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="mt-4 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            selectedModels.length > 0 ? 'bg-green-400' : 'bg-yellow-400'
          }`}></div>
          <span className={`text-xs ${
            selectedModels.length > 0 ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {selectedModels.length > 0 
              ? `Ready for batch generation with ${selectedModels.length} model${selectedModels.length > 1 ? 's' : ''}`
              : 'Select models for batch processing'
            }
          </span>
        </div>
      </div>
    );
  }

  // Single-select mode (original)
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
