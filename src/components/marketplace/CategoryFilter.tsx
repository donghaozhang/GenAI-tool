
import React from 'react';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { name: 'Audio to Audio', count: 6 },
  { name: 'Audio to Video', count: 1 },
  { name: 'Image to 3D', count: 12 },
  { name: 'Image to Image', count: 180 },
  { name: 'Image to JSON', count: 1 },
  { name: 'Image to Video', count: 71 },
  { name: 'JSON', count: 2 },
  { name: 'Large Language Models', count: 2 },
  { name: 'Speech to Speech', count: 2 },
  { name: 'Speech to Text', count: 8 },
  { name: 'Text to Audio', count: 25 },
  { name: 'Text to Image', count: 91 },
  { name: 'Text to Speech', count: 9 },
  { name: 'Text to Video', count: 56 },
  { name: 'Training', count: 12 },
  { name: 'Video to Video', count: 41 },
  { name: 'Vision', count: 22 },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Category</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <label
            key={category.name}
            className="flex items-center justify-between cursor-pointer hover:bg-gray-700 p-2 rounded"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedCategory === category.name}
                onChange={(e) => 
                  onCategoryChange(e.target.checked ? category.name : '')
                }
                className="mr-3 w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-300">{category.name}</span>
            </div>
            <span className="text-gray-500 text-sm">{category.count}</span>
          </label>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="mr-3 w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded"
          />
          <span className="text-gray-300">Show deprecated</span>
        </label>
      </div>
    </div>
  );
};
