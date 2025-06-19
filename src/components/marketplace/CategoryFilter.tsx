import React from 'react';
import { getCategoryCounts } from '../../constants/models';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const categories = getCategoryCounts();

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Category</h3>
      <div className="space-y-2">
        {categories.map((category) => {
          const isDisabled = category.count === 0;
          const isSelected = selectedCategory === category.name;
          
          return (
            <label
              key={category.name}
              className={`flex items-center justify-between p-2 rounded ${
                isDisabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={(e) => {
                    if (!isDisabled) {
                      onCategoryChange(e.target.checked ? category.name : '');
                    }
                  }}
                  className={`mr-3 w-4 h-4 rounded focus:ring-blue-500 ${
                    isDisabled
                      ? 'bg-gray-600 border-gray-600 cursor-not-allowed'
                      : 'text-blue-500 bg-gray-700 border-gray-600'
                  }`}
                />
                <span className={`${
                  isDisabled ? 'text-gray-500' : 'text-gray-300'
                }`}>
                  {category.name}
                </span>
              </div>
              <span className={`text-sm ${
                isDisabled ? 'text-gray-600' : 'text-gray-500'
              }`}>
                {category.count}
              </span>
            </label>
          );
        })}
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
