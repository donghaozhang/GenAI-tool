
import React from 'react';
import { Video, Volume2, Zap, ArrowUp, Image, Camera } from 'lucide-react';

const trendingItems = [
  { name: 'Video models', icon: Video },
  { name: 'Audio models', icon: Volume2 },
  { name: 'Training', icon: Zap },
  { name: 'Upscalers', icon: ArrowUp },
  { name: 'Flux', icon: Image },
  { name: 'Background Removal', icon: Image },
  { name: 'Product Photography', icon: Camera },
];

export const TrendingSection: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Search trends</h2>
      <div className="flex flex-wrap gap-3">
        {trendingItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.name}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-700"
            >
              <IconComponent className="w-4 h-4" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
