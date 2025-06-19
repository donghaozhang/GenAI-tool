
import React, { useState } from 'react';
import { generateImageWithModel } from '../../services/imageGeneration';
import { toast } from 'sonner';
import { Loader2, Play, Sparkles } from 'lucide-react';

interface ModelCardProps {
  model: {
    id: string;
    title: string;
    description: string;
    category: string;
    categoryLabel: string;
    image: string;
    isNew: boolean;
    tags: string[];
  };
}

export const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'text-to-video':
        return 'bg-purple-600';
      case 'image-to-video':
        return 'bg-blue-600';
      case 'image-to-image':
        return 'bg-green-600';
      case 'text-to-image':
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
    }
  };

  const handleCardClick = async () => {
    if (isGenerating) return;
    
    console.log('Model clicked:', model.title);
    setIsGenerating(true);
    
    try {
      toast.info(`Generating with ${model.title}...`);
      const imageUrl = await generateImageWithModel(model.id);
      console.log('Generated image URL:', imageUrl);
      toast.success('Generation completed successfully!');
    } catch (error) {
      console.error('Error generating:', error);
      toast.error('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-all duration-200 border border-gray-700 hover:border-gray-600 cursor-pointer transform hover:scale-105 hover:shadow-lg"
      onClick={handleCardClick}
    >
      {/* Header with title and new badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-white text-lg hover:text-blue-400 transition-colors">
            {model.title}
          </h3>
        </div>
        {model.isNew && (
          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            NEW
          </span>
        )}
      </div>

      {/* Category badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white font-medium ${getCategoryColor(model.category)}`}>
          <Play className="w-3 h-3" />
          {model.categoryLabel}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 leading-relaxed min-h-[3rem]">
        {model.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {model.tags.slice(0, 4).map((tag, index) => (
          <span
            key={index}
            className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md border border-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Action area */}
      <div className="border-t border-gray-700 pt-4">
        {isGenerating ? (
          <div className="flex items-center justify-center text-blue-400">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm">Generating...</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs">Click to generate</span>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Play className="w-4 h-4 text-white ml-0.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
