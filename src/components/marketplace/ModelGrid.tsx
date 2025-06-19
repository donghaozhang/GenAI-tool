
import React from 'react';
import { ModelCard } from './ModelCard';

interface ModelGridProps {
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
}

const featuredModels = [
  {
    id: 'veo3',
    title: 'Veo 3',
    description: 'Veo 3 by Google, the most advanced AI video generation model in the world. With sound too!',
    category: 'text-to-video',
    categoryLabel: 'Text to Video',
    image: '',
    isNew: true,
    tags: ['video', 'google', 'sound'],
  },
  {
    id: 'kling-video-master',
    title: 'Kling Video 2.1 Master',
    description: 'The premium endpoint for Kling 2.1, designed for top-tier image-to-video generation with exceptional quality and detail.',
    category: 'image-to-video',
    categoryLabel: 'Image to Video',
    image: '',
    isNew: true,
    tags: ['image-to-video', 'premium', 'high-quality'],
  },
  {
    id: 'kling-video-standard',
    title: 'Kling Video 2.1 Standard',
    description: 'Kling 2.1 Standard is a cost-efficient endpoint for the Kling 2.1 model, delivering high-quality image-to-video generation at an affordable price point.',
    category: 'image-to-video',
    categoryLabel: 'Image to Video',
    image: '',
    isNew: true,
    tags: ['image-to-video', 'cost-efficient', 'affordable'],
  },
  {
    id: 'flux-pro-kontext',
    title: 'FLUX Pro Kontext',
    description: 'FLUX.1 Kontext [pro] handles both text and reference images as inputs, seamlessly enabling targeted, local editing and enhancement of specific image regions.',
    category: 'image-to-image',
    categoryLabel: 'Image to Image',
    image: '',
    isNew: true,
    tags: ['flux', 'kontext', 'reference', 'editing'],
  },
  {
    id: 'imagen4-preview',
    title: 'Imagen 4 Preview',
    description: "Google's highest quality image generation model with exceptional detail, photorealism, and creative capabilities for professional-grade image creation.",
    category: 'text-to-image',
    categoryLabel: 'Text to Image',
    image: '',
    isNew: true,
    tags: ['google', 'imagen', 'quality', 'photorealistic'],
  },
  {
    id: 'pixverse-v4-5',
    title: 'PixVerse v4.5',
    description: 'Generate high quality video clips from text and image prompts using PixVerse v4.5 with advanced motion control and stylistic transformations.',
    category: 'image-to-video',
    categoryLabel: 'Image to Video',
    image: '',
    isNew: false,
    tags: ['pixverse', 'stylized', 'transform', 'motion'],
  },
];

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
