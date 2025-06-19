export interface FeaturedModel {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  image: string;
  isNew: boolean;
  tags: string[];
}

export const featuredModels: FeaturedModel[] = [
  // Text to Image models first
  {
    id: 'fal-ai/imagen-4-preview',
    title: 'Imagen 4 Preview',
    description: "Google's highest quality image generation model with exceptional detail, photorealism, and creative capabilities for professional-grade image creation.",
    category: 'text-to-image',
    categoryLabel: 'Text to Image',
    image: '',
    isNew: true,
    tags: ['google', 'imagen', 'quality', 'photorealistic'],
  },
  // Image to Video models second
  {
    id: 'fal-ai/kling-video/v2.1/master/image-to-video',
    title: 'Kling Video 2.1 Master',
    description: 'The premium endpoint for Kling 2.1, designed for top-tier image-to-video generation with exceptional quality and detail.',
    category: 'image-to-video',
    categoryLabel: 'Image to Video',
    image: '',
    isNew: true,
    tags: ['image-to-video', 'premium', 'high-quality'],
  },
  {
    id: 'fal-ai/kling-video/v2.1/standard/image-to-video',
    title: 'Kling Video 2.1 Standard',
    description: 'Kling 2.1 Standard is a cost-efficient endpoint for the Kling 2.1 model, delivering high-quality image-to-video generation at an affordable price point.',
    category: 'image-to-video',
    categoryLabel: 'Image to Video',
    image: '',
    isNew: true,
    tags: ['image-to-video', 'cost-efficient', 'affordable'],
  },
  {
    id: 'fal-ai/pixverse/v4.5',
    title: 'PixVerse v4.5',
    description: 'Generate high quality video clips from text and image prompts using PixVerse v4.5 with advanced motion control and stylistic transformations.',
    category: 'image-to-video',
    categoryLabel: 'Image to Video',
    image: '',
    isNew: false,
    tags: ['pixverse', 'stylized', 'transform', 'motion'],
  },
  // Other categories
  {
    id: 'fal-ai/flux-pro/kontext',
    title: 'FLUX Pro Kontext',
    description: 'FLUX.1 Kontext [pro] handles both text and reference images as inputs, seamlessly enabling targeted, local editing and enhancement of specific image regions.',
    category: 'image-to-image',
    categoryLabel: 'Image to Image',
    image: '',
    isNew: true,
    tags: ['flux', 'kontext', 'reference', 'editing'],
  },
  {
    id: 'fal-ai/veo-3',
    title: 'Veo 3',
    description: 'Veo 3 by Google, the most advanced AI video generation model in the world. With sound too!',
    category: 'text-to-video',
    categoryLabel: 'Text to Video',
    image: '',
    isNew: true,
    tags: ['video', 'google', 'sound'],
  },
];

// All possible categories for the filter
export const allCategories = [
  'Audio to Audio',
  'Audio to Text',
  'Image to Audio',
  'Image to Image',
  'Image to Text',
  'Image to Video',
  'Text to Audio',
  'Text to Image',
  'Text to Text',
  'Text to Video',
  'Video to Audio',
  'Video to Text',
  'Video to Video',
];

// Function to calculate category counts based on actual models
export const getCategoryCounts = () => {
  const categoryCounts: { [key: string]: number } = {};
  
  // Initialize all categories with 0
  allCategories.forEach(category => {
    categoryCounts[category] = 0;
  });
  
  // Count actual models
  featuredModels.forEach(model => {
    if (categoryCounts.hasOwnProperty(model.categoryLabel)) {
      categoryCounts[model.categoryLabel]++;
    }
  });
  
  // Return array format for the component
  return allCategories.map(category => ({
    name: category,
    count: categoryCounts[category]
  }));
}; 