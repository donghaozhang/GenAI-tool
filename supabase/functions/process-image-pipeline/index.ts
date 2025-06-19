import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { fal } from "npm:@fal-ai/client";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessImagePipelineParams {
  modelId: string;
  sourceImageUrl?: string;
  prompt?: string;
}

// Helper function to validate image URL
const isValidImageUrl = (url: string): boolean => {
  // Check for data URLs (base64 encoded images)
  if (url.startsWith('data:image/')) {
    return true;
  }
  
  // Check for HTTP/HTTPS URLs
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FAL_API_KEY = Deno.env.get('FAL_API_KEY');
    
    if (!FAL_API_KEY) {
      throw new Error('FAL_API_KEY not found in environment variables');
    }

    // Configure FAL client
    fal.config({
      credentials: FAL_API_KEY
    });

    const { modelId, sourceImageUrl, prompt }: ProcessImagePipelineParams = await req.json();

    console.log(`Processing pipeline for model: ${modelId}`);
    console.log(`Source image URL: ${sourceImageUrl ? 'provided' : 'not provided'}`);
    console.log(`Source image URL type: ${sourceImageUrl?.startsWith('data:') ? 'data URL' : sourceImageUrl?.startsWith('http') ? 'HTTP URL' : 'unknown'}`);
    console.log(`Prompt: ${prompt}`);

    // Validate required inputs
    if (!modelId) {
      throw new Error('Model ID is required');
    }

    // Validate source image URL format if provided
    if (sourceImageUrl && !isValidImageUrl(sourceImageUrl)) {
      throw new Error('Invalid image URL format. Expected data URL or HTTP/HTTPS URL.');
    }

    let falModelId = '';
    let input: any = {};

    // Configure FAL model ID and input based on model
    console.log('Configuring FAL model for:', modelId);
    
    switch (modelId) {
      case 'fal-ai/kling-video/v2.1/standard/image-to-video':
      case 'kling-video':
        if (!sourceImageUrl) {
          throw new Error('Source image URL is required for image-to-video models');
        }
        falModelId = 'fal-ai/kling-video/v2.1/standard/image-to-video';
        input = {
          image_url: sourceImageUrl,
          prompt: prompt || 'Convert this image to a smooth video with natural motion',
          duration: 5,
          aspect_ratio: '16:9'
        };
        break;
      
      case 'fal-ai/flux-pro':
      case 'flux-pro':
        if (!sourceImageUrl) {
          throw new Error('Source image URL is required for image-to-image models');
        }
        falModelId = 'fal-ai/flux-pro';
        input = {
          image_url: sourceImageUrl,
          prompt: prompt || 'Enhance this image with better quality and details',
          image_size: 'square_hd',
          num_inference_steps: 28,
          guidance_scale: 3.5,
          strength: 0.8
        };
        break;
      
      case 'fal-ai/flux-pro/kontext':
      case 'flux-pro-kontext':
        if (!sourceImageUrl) {
          throw new Error('Source image URL is required for image-to-image models');
        }
        falModelId = 'fal-ai/flux-pro/kontext';
        input = {
          prompt: prompt || 'Modify and enhance this image with contextual understanding',
          image_url: sourceImageUrl,
          guidance_scale: 3.5,
          num_images: 1,
          safety_tolerance: 2,
          output_format: 'jpeg'
        };
        break;
      
      case 'fal-ai/imagen-4-preview':
      case 'imagen4':
        // For Imagen 4, use it as text-to-image if no source image
        if (sourceImageUrl) {
          falModelId = 'fal-ai/flux/schnell';
          input = {
            image_url: sourceImageUrl,
            prompt: prompt || 'Create a variation of this image with similar style and composition',
            image_size: 'square_hd',
            num_inference_steps: 4,
            guidance_scale: 3.5,
            strength: 0.75
          };
        } else {
          falModelId = 'fal-ai/flux/schnell';
          input = {
            prompt: prompt || 'Create a high-quality image',
            image_size: 'square_hd',
            num_inference_steps: 4,
            guidance_scale: 3.5
          };
        }
        break;
      
      case 'fal-ai/aura-sr':
      case 'aura-sr':
        if (!sourceImageUrl) {
          throw new Error('Source image URL is required for super-resolution models');
        }
        falModelId = 'fal-ai/aura-sr';
        input = {
          image_url: sourceImageUrl,
          scale_factor: 4
        };
        break;
      
      case 'fal-ai/bytedance/seedance/v1/lite/text-to-video':
      case 'seedance-text-to-video':
        falModelId = 'fal-ai/bytedance/seedance/v1/lite/text-to-video';
        input = {
          prompt: prompt || 'Create a beautiful video with smooth motion',
          duration: 5,
          aspect_ratio: '16:9',
          fps: 24
        };
        break;
      
      case 'fal-ai/hunyuan3d-v21':
      case 'hunyuan3d-v21':
        if (!sourceImageUrl) {
          throw new Error('Source image URL is required for 3D generation models');
        }
        falModelId = 'fal-ai/hunyuan3d-v21';
        input = {
          input_image_url: sourceImageUrl,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          octree_resolution: 256,
          textured_mesh: true
        };
        break;
      
      default:
        console.error('Unsupported model ID:', modelId);
        throw new Error(`Unsupported model: ${modelId}. Available models: fal-ai/kling-video/v2.1/standard/image-to-video, fal-ai/flux-pro, fal-ai/flux-pro/kontext, fal-ai/imagen-4-preview, fal-ai/aura-sr, fal-ai/bytedance/seedance/v1/lite/text-to-video, fal-ai/hunyuan3d-v21`);
    }

    console.log(`Making request with FAL model: ${falModelId}`);
    console.log(`Input keys:`, Object.keys(input));
    console.log(`Image URL format:`, sourceImageUrl ? (sourceImageUrl.startsWith('data:') ? 'data URL' : 'HTTP URL') : 'none');

    // Use FAL client to subscribe to the model
    const result = await fal.subscribe(falModelId, {
      input: input,
      logs: true
    });

    console.log('Pipeline processing successful:', result);
    const data = result.data;

    // Extract the output URL based on the model type
    let outputUrl = '';
    if (modelId.includes('kling-video') || modelId.includes('seedance')) {
      outputUrl = data.video?.url || data.video_url || '';
    } else if (modelId.includes('hunyuan3d')) {
      outputUrl = data.model_mesh?.url || '';
    } else {
      outputUrl = data.images?.[0]?.url || data.image?.url || '';
    }

    if (!outputUrl) {
      console.error('No output URL found in response data:', data);
      throw new Error('No output URL found in response');
    }

    console.log('Successfully extracted output URL:', outputUrl);

    return new Response(JSON.stringify({ outputUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-image-pipeline function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
