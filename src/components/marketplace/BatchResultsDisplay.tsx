import React from 'react';
import { CheckCircle, XCircle, Clock, Image, Play } from 'lucide-react';
import { BatchGenerationResult } from '@/services/imageGeneration';
import { featuredModels } from '@/constants/models';

interface BatchResultsDisplayProps {
  results: BatchGenerationResult[];
  isGenerating: boolean;
  onImageClick?: (imageUrl: string, modelTitle: string) => void;
}

export const BatchResultsDisplay: React.FC<BatchResultsDisplayProps> = ({ 
  results, 
  isGenerating,
  onImageClick 
}) => {
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

  const getModelInfo = (modelId: string) => {
    return featuredModels.find(m => m.id === modelId) || {
      title: modelId,
      categoryLabel: 'Unknown',
      description: 'Model information not available'
    };
  };

  if (results.length === 0 && !isGenerating) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Batch Generation Results</h2>
        {isGenerating && (
          <div className="flex items-center gap-2 text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-sm">Processing...</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {results.map((result) => {
          const modelInfo = getModelInfo(result.modelId);
          
          return (
            <div 
              key={result.modelId}
              className={`p-4 rounded-lg border transition-colors ${
                result.success 
                  ? 'bg-green-500/5 border-green-500/30' 
                  : 'bg-red-500/5 border-red-500/30'
              }`}
            >
              {/* Model Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <h3 className="font-medium text-white">{modelInfo.title}</h3>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(modelInfo.categoryLabel)}`}>
                    {modelInfo.categoryLabel}
                  </div>
                </div>
                
                {result.duration && (
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{(result.duration / 1000).toFixed(1)}s</span>
                  </div>
                )}
              </div>

              {/* Results */}
              {result.success && result.imageUrls ? (
                <div>
                  <p className="text-sm text-gray-400 mb-3">
                    Generated {result.imageUrls.length} media file{result.imageUrls.length > 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {result.imageUrls.map((imageUrl, index) => {
                      const isVideo = imageUrl.toLowerCase().includes('.mp4') || 
                                      imageUrl.toLowerCase().includes('.mov') || 
                                      imageUrl.toLowerCase().includes('.webm') ||
                                      imageUrl.toLowerCase().includes('.avi');
                      
                      return (
                        <div 
                          key={index}
                          className="relative group cursor-pointer"
                          onClick={() => onImageClick?.(imageUrl, modelInfo.title)}
                        >
                          {isVideo ? (
                            <video
                              src={imageUrl}
                              className="w-full h-24 object-cover rounded-lg border border-gray-600 group-hover:border-blue-500 transition-colors"
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={imageUrl}
                              alt={`Generated by ${modelInfo.title} - ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-600 group-hover:border-blue-500 transition-colors"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                            {isVideo ? (
                              <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            ) : (
                              <Image className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                          
                          {/* Media type indicator */}
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                            {isVideo ? '🎥' : '🖼️'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : result.error ? (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm font-medium">Error:</p>
                  <p className="text-red-300 text-sm">{result.error}</p>
                </div>
              ) : isGenerating ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span className="text-sm">Generating...</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {results.length > 0 && !isGenerating && (
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">
              Batch Summary: {results.filter(r => r.success).length} successful, {results.filter(r => !r.success).length} failed
            </span>
            <span className="text-gray-400">
              Total time: {Math.max(...results.map(r => r.duration || 0)) / 1000}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}; 