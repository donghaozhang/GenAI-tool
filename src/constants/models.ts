export interface FeaturedModel {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  image: string;
  isNew: boolean;
  tags: string[];
  // Pipeline-specific properties (optional for backward compatibility)
  type?: 'image-to-video' | 'image-to-image' | 'video-to-audio' | 'text-to-video' | 'image-to-3d' | 'text-to-3d' | 'text-to-image' | 'video-to-video';
  typeLabel?: string; // User-friendly type display
  isPipelineModel?: boolean; // Flag to identify pipeline models
}

export const featuredModels: FeaturedModel[] = [
  // Text to Image models first
  {
    id: 'fal-ai/flux-1/schnell',
    title: 'fal-ai/flux-1/schnell',
    description: 'FLUX.1 [schnell] - Fastest inference in the world for the 12 billion parameter FLUX.1 text-to-image model. Turbo mode for next generation image generation.',
    category: 'text-to-image',
    categoryLabel: 'Text to Image',
    image: '',
    isNew: true,
    tags: ['flux', 'schnell', 'fastest', 'turbo', 'commercial', '12b-params'],
    type: 'text-to-image',
    typeLabel: 'Text to Image',
  },
  {
    id: 'fal-ai/flux/dev',
    title: 'fal-ai/flux/dev',
    description: 'FLUX.1 [dev] is a 12 billion parameter flow transformer that generates high-quality images from text. Suitable for personal and commercial use.',
    category: 'text-to-image',
    categoryLabel: 'Text to Image',
    image: '',
    isNew: true,
    tags: ['flux', 'dev', 'transformer', 'high-quality', 'commercial'],
    type: 'text-to-image',
    typeLabel: 'Text to Image',
  },
  {
    id: 'fal-ai/bytedance/seedream/v3/text-to-image',
    title: 'fal-ai/bytedance/seedream/v3/text-to-image',
    description: 'Bytedance SeedDream 3.0 is a bilingual (Chinese and English) text-to-image model with native 2K resolution, exceptional text layout, and fast 3-second generation.',
    category: 'text-to-image',
    categoryLabel: 'Text to Image',
    image: '',
    isNew: true,
    tags: ['bytedance', 'seedream', '2k-resolution', 'bilingual', 'fast-generation', 'text-layout'],
    type: 'text-to-image',
    typeLabel: 'Text to Image',
  },
  {
    id: 'fal-ai/imagen4/preview',
    title: 'fal-ai/imagen4/preview',
    description: "Google's highest quality image generation model with exceptional detail, photorealism, and creative capabilities for professional-grade image creation.",
    category: 'text-to-image',
    categoryLabel: 'Text to Image',
    image: '',
    isNew: true,
    tags: ['google', 'imagen', 'quality', 'photorealistic'],
    type: 'text-to-image',
    typeLabel: 'Text to Image',
  },
  
  // Image to Image models
  {
    id: 'fal-ai/luma-photon/reframe',
    title: 'fal-ai/luma-photon/reframe',
    description: 'Luma Photon Reframe extends and reframes images with intelligent content expansion. Seamlessly blends new content to enhance creativity and adaptability at a fraction of the cost.',
    category: 'image-to-image',
    categoryLabel: 'Image to Image',
    image: '',
    isNew: true,
    tags: ['luma', 'photon', 'reframe', 'extend', 'aspect-ratio', 'creative'],
    type: 'image-to-image',
    typeLabel: 'Image to Image',
  },
  {
    id: 'fal-ai/flux-pro/kontext',
    title: 'fal-ai/flux-pro/kontext',
    description: 'FLUX.1 Kontext [pro] handles both text and reference images as inputs, seamlessly enabling targeted, local editing and enhancement of specific image regions.',
    category: 'image-to-image',
    categoryLabel: 'Image to Image',
    image: '',
    isNew: true,
    tags: ['flux', 'kontext', 'reference', 'editing'],
    type: 'image-to-image',
    typeLabel: 'Image to Image',
  },
  {
    id: 'fal-ai/flux-pro',
    title: 'fal-ai/flux-pro',
    description: 'Enhance image quality with FLUX Pro, delivering professional-grade image enhancement and refinement capabilities.',
    category: 'image-to-image',
    categoryLabel: 'Image to Image',
    image: '',
    isNew: false,
    tags: ['flux', 'enhance', 'quality'],
    type: 'image-to-image',
    typeLabel: 'Image to Image',
    isPipelineModel: true,
  },
  {
    id: 'fal-ai/aura-sr',
    title: 'fal-ai/aura-sr',
    description: 'Super-resolution image upscaling powered by advanced AI algorithms for exceptional detail enhancement and clarity.',
    category: 'image-to-image',
    categoryLabel: 'Image to Image',
    image: '',
    isNew: false,
    tags: ['super-resolution', 'upscaling', 'enhancement'],
    type: 'image-to-image',
    typeLabel: 'Image to Image',
    isPipelineModel: true,
  },
  {
    id: 'fal-ai/imageutils/rembg',
    title: 'fal-ai/imageutils/rembg',
    description: 'Remove the background from an image using advanced AI segmentation technology. Supports cropping to bounding box around the subject.',
    category: 'image-to-image',
    categoryLabel: 'Image to Image',
    image: '',
    isNew: false,
    tags: ['background', 'removal', 'segmentation', 'rembg'],
    type: 'image-to-image',
    typeLabel: 'Image to Image',
    isPipelineModel: true,
  },
  
  // Image to Video models
  {
    id: 'fal-ai/minimax/hailuo-02/pro/image-to-video',
    title: 'fal-ai/minimax/hailuo-02/pro/image-to-video',
    description: 'MiniMax Hailuo-02 Image To Video API (Pro, 1080p): Advanced image-to-video generation model with 1080p resolution',
    category: 'image-to-video',
    categoryLabel: 'Image to Video',
    image: '',
    isNew: true,
    tags: ['minimax', 'hailuo', 'image-to-video', '1080p', 'pro'],
    type: 'image-to-video',
    typeLabel: 'Image to Video',
  },
  {
    id: 'fal-ai/minimax/hailuo-02/standard/image-to-video',
    title: 'fal-ai/minimax/hailuo-02/standard/image-to-video',
    description: 'MiniMax Hailuo-02 Image To Video API (Standard, 768p): Advanced image-to-video generation model with 768p resolution',
    category: 'image-to-video',
    categoryLabel: 'Image to Video',
    image: '',
    isNew: true,
    tags: ['minimax', 'hailuo', 'image-to-video', '768p'],
    type: 'image-to-video',
    typeLabel: 'Image to Video',
  },
  {
    id: 'fal-ai/kling-video/v2.1/master/image-to-video',
    title: 'fal-ai/kling-video/v2.1/master/image-to-video',
    description: 'The premium endpoint for Kling 2.1, designed for top-tier image-to-video generation with exceptional quality and detail.',
    category: 'image-to-video',
    categoryLabel: 'Image to Video',
    image: '',
    isNew: true,
    tags: ['image-to-video', 'premium', 'high-quality'],
    type: 'image-to-video',
    typeLabel: 'Image to Video',
  },
  {
    id: 'fal-ai/kling-video/v2.1/standard/image-to-video',
    title: 'fal-ai/kling-video/v2.1/standard/image-to-video',
    description: 'Kling 2.1 Standard is a cost-efficient endpoint for the Kling 2.1 model, delivering high-quality image-to-video generation at an affordable price point.',
    category: 'image-to-video',
    categoryLabel: 'Image to Video',
    image: '',
    isNew: true,
    tags: ['image-to-video', 'cost-efficient', 'affordable'],
    type: 'image-to-video',
    typeLabel: 'Image to Video',
  },
  {
    id: 'fal-ai/pixverse/v4.5',
    title: 'fal-ai/pixverse/v4.5',
    description: 'Generate high quality video clips from text and image prompts using PixVerse v4.5 with advanced motion control and stylistic transformations.',
    category: 'image-to-video',
    categoryLabel: 'Image to Video',
    image: '',
    isNew: false,
    tags: ['pixverse', 'stylized', 'transform', 'motion'],
    type: 'image-to-video',
    typeLabel: 'Image to Video',
  },
  
  // Text to Video models
  {
    id: 'fal-ai/veo-3',
    title: 'fal-ai/veo-3',
    description: 'Veo 3 by Google, the most advanced AI video generation model in the world. With sound too!',
    category: 'text-to-video',
    categoryLabel: 'Text to Video',
    image: '',
    isNew: true,
    tags: ['video', 'google', 'sound'],
    type: 'text-to-video',
    typeLabel: 'Text to Video',
  },
  {
    id: 'fal-ai/bytedance/seedance/v1/lite/text-to-video',
    title: 'fal-ai/bytedance/seedance/v1/lite/text-to-video',
    description: 'Generate dynamic video content from text prompts using SeeeDance v1 Lite with efficient processing and creative motion synthesis.',
    category: 'text-to-video',
    categoryLabel: 'Text to Video',
    image: '',
    isNew: false,
    tags: ['seedance', 'text-to-video', 'motion'],
    type: 'text-to-video',
    typeLabel: 'Text to Video',
    isPipelineModel: true,
  },
  
  // Video to Audio models
  {
    id: 'video-to-sound',
    title: 'video-to-sound',
    description: 'Generate realistic sound effects and audio from video content using ElevenLabs advanced AI audio synthesis technology.',
    category: 'video-to-audio',
    categoryLabel: 'Video to Audio',
    image: '',
    isNew: false,
    tags: ['elevenlabs', 'video-to-audio', 'sound-effects'],
    type: 'video-to-audio',
    typeLabel: 'Video to Audio',
    isPipelineModel: true,
  },
  
  // Video to Video models
  {
    id: 'fal-ai/mmaudio-v2',
    title: 'fal-ai/mmaudio-v2',
    description: 'MMAudio V2 generates synchronized audio for videos based on text prompts. Combines seamlessly with video models to create videos with audio.',
    category: 'video-to-video',
    categoryLabel: 'Video to Video',
    image: '',
    isNew: true,
    tags: ['mmaudio', 'audio-generation', 'video-enhancement', 'synchronized', 'audio-sync'],
    type: 'video-to-video',
    typeLabel: 'Video to Video',
  },
  
  // Image to 3D models
  {
    id: 'fal-ai/hunyuan3d-v21',
    title: 'fal-ai/hunyuan3d-v21',
    description: 'Generate detailed 3D models from 2D images using Hunyuan3D v2.1 with advanced geometry reconstruction and texture mapping.',
    category: 'image-to-3d',
    categoryLabel: 'Image to 3D',
    image: '',
    isNew: false,
    tags: ['hunyuan3d', '3d-generation', 'reconstruction'],
    type: 'image-to-3d',
    typeLabel: 'Image to 3D',
    isPipelineModel: true,
  },
];

// All possible categories for the filter
export const allCategories = [
  'Audio to Audio',
  'Audio to Text',
  'Image to 3D',
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

// Legacy pipeline models interface for backward compatibility
export interface PipelineModel {
  id: string;
  name: string;
  type: 'image-to-video' | 'image-to-image' | 'video-to-audio' | 'text-to-video' | 'image-to-3d' | 'text-to-3d' | 'text-to-image' | 'video-to-video';
  typeLabel: string;
  description: string;
}

// Convert featuredModels to pipeline format for backward compatibility
export const pipelineModels: PipelineModel[] = featuredModels
  .filter(model => model.type && model.typeLabel)
  .map(model => ({
    id: model.id,
    name: model.title,
    type: model.type!,
    typeLabel: model.typeLabel!,
    description: model.description,
  }));

// Helper functions to filter models by type
export const getModelsByCategory = (categoryLabel: string) => {
  return featuredModels.filter(model => model.categoryLabel === categoryLabel);
};

export const getPipelineModelsByType = (type: string) => {
  return featuredModels.filter(model => model.type === type);
};

export const getMainModels = () => {
  return featuredModels.filter(model => !model.isPipelineModel);
};

export const getAllModels = () => {
  return featuredModels;
}; 