import React from 'react';
import { ModelCard } from './ModelCard';
import { featuredModels } from '../../constants/models';

interface ModelGridProps {
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
}

export const ModelGrid: React.FC<ModelGridProps> = ({
  searchQuery,
  selectedCategory,
  sortBy,
}) => {
  const filteredModels = featuredModels.filter((model) => {
    const matchesSearch = model.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || model.categoryLabel === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredModels.map((model) => (
        <ModelCard key={model.id} model={model} />
      ))}
    </div>
  );
};
