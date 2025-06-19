
export interface PipelineModel {
  id: string;
  name: string;
  type: 'image-to-video' | 'image-to-image' | 'video-to-audio' | 'text-to-video' | 'image-to-3d' | 'text-to-3d';
  description: string;
}

export const pipelineModels: PipelineModel[] = [
  { id: 'kling-video', name: 'Kling Video', type: 'image-to-video', description: 'Convert image to video' },
  { id: 'flux-pro', name: 'FLUX Pro Enhance', type: 'image-to-image', description: 'Enhance image quality' },
  { id: 'flux-pro-kontext', name: 'FLUX Pro Kontext', type: 'image-to-image', description: 'Modify and enhance images with context' },
  { id: 'imagen4', name: 'Imagen 4 Variation', type: 'image-to-image', description: 'Create image variations' },
  { id: 'aura-sr', name: 'Aura SR', type: 'image-to-image', description: 'Super-resolution image upscaling' },
  { id: 'background-removal', name: 'Background Removal', type: 'image-to-image', description: 'Remove image background' },
  { id: 'video-to-sound', name: 'ElevenLabs Video to Sound', type: 'video-to-audio', description: 'Generate sound effects from video using AI' },
  { id: 'seedance-text-to-video', name: 'SeeeDance Text to Video', type: 'text-to-video', description: 'Generate video from text prompt using SeeeDance' },
  { id: 'hunyuan3d-v21', name: 'Hunyuan3D v2.1', type: 'image-to-3d', description: 'Generate 3D models from images using Hunyuan3D' },
];
