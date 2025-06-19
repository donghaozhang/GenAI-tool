// Pipeline models for image processing workflows
export interface PipelineModel {
  id: string;
  name: string;
  type: 'image-to-video' | 'image-to-image' | 'video-to-audio' | 'text-to-video' | 'image-to-3d' | 'text-to-3d';
  typeLabel: string; // User-friendly type display
  description: string;
}

export const pipelineModels: PipelineModel[] = [
  { 
    id: 'fal-ai/kling-video/v2.1/standard/image-to-video', 
    name: 'Kling Video', 
    type: 'image-to-video', 
    typeLabel: 'Image to Video',
    description: 'Convert image to video' 
  },
  { 
    id: 'fal-ai/flux-pro', 
    name: 'FLUX Pro Enhance', 
    type: 'image-to-image', 
    typeLabel: 'Image to Image',
    description: 'Enhance image quality' 
  },
  { 
    id: 'fal-ai/flux-pro/kontext', 
    name: 'FLUX Pro Kontext', 
    type: 'image-to-image', 
    typeLabel: 'Image to Image',
    description: 'Modify and enhance images with context' 
  },
  { 
    id: 'fal-ai/imagen-4-preview', 
    name: 'Imagen 4 Variation', 
    type: 'image-to-image', 
    typeLabel: 'Image to Image',
    description: 'Create image variations' 
  },
  { 
    id: 'fal-ai/aura-sr', 
    name: 'Aura SR', 
    type: 'image-to-image', 
    typeLabel: 'Image to Image',
    description: 'Super-resolution image upscaling' 
  },
  { 
    id: 'background-removal', 
    name: 'Background Removal', 
    type: 'image-to-image', 
    typeLabel: 'Image to Image',
    description: 'Remove image background' 
  },
  { 
    id: 'video-to-sound', 
    name: 'ElevenLabs Video to Sound', 
    type: 'video-to-audio', 
    typeLabel: 'Video to Audio',
    description: 'Generate sound effects from video using AI' 
  },
  { 
    id: 'fal-ai/bytedance/seedance/v1/lite/text-to-video', 
    name: 'SeeeDance Text to Video', 
    type: 'text-to-video', 
    typeLabel: 'Text to Video',
    description: 'Generate video from text prompt using SeeeDance' 
  },
  { 
    id: 'fal-ai/hunyuan3d-v21', 
    name: 'Hunyuan3D v2.1', 
    type: 'image-to-3d', 
    typeLabel: 'Image to 3D',
    description: 'Generate 3D models from images using Hunyuan3D' 
  },
];
