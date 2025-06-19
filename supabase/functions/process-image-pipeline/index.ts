
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessImagePipelineParams {
  modelId: string;
  sourceImageUrl?: string;
  prompt?: string;
}

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

    const { modelId, sourceImageUrl, prompt }: ProcessImagePipelineParams = await req.json();

    console.log(`Processing pipeline for model: ${modelId}`);
    console.log(`Source image URL: ${sourceImageUrl}`);
    console.log(`Prompt: ${prompt}`);

    let apiEndpoint = '';
    let requestBody: any = {};

    // Configure API endpoint and request body based on model
    switch (modelId) {
      case 'kling-video':
        apiEndpoint = 'https://fal.run/fal-ai/kling-video/v2.1/standard/image-to-video';
        requestBody = {
          image_url: sourceImageUrl,
          prompt: prompt || 'Convert this image to a smooth video with natural motion',
          duration: 5,
          aspect_ratio: '16:9'
        };
        break;
      
      case 'flux-pro':
        apiEndpoint = 'https://fal.run/fal-ai/flux-pro';
        requestBody = {
          image_url: sourceImageUrl,
          prompt: prompt || 'Enhance this image with better quality and details',
          image_size: 'square_hd',
          num_inference_steps: 28,
          guidance_scale: 3.5,
          strength: 0.8
        };
        break;
      
      case 'flux-pro-kontext':
        apiEndpoint = 'https://fal.run/fal-ai/flux-pro/kontext';
        requestBody = {
          image_url: sourceImageUrl,
          prompt: prompt || 'Modify and enhance this image with contextual understanding',
          image_size: 'square_hd',
          num_inference_steps: 28,
          guidance_scale: 3.5,
          strength: 0.75
        };
        break;
      
      case 'imagen4':
        apiEndpoint = 'https://fal.run/fal-ai/flux/schnell';
        requestBody = {
          prompt: prompt || 'Create a variation of this image with similar style and composition',
          image_size: 'square_hd',
          num_inference_steps: 4,
          guidance_scale: 3.5
        };
        break;
      
      case 'aura-sr':
        apiEndpoint = 'https://fal.run/fal-ai/aura-sr';
        requestBody = {
          image_url: sourceImageUrl,
          scale_factor: 4
        };
        break;
      
      case 'seedance-text-to-video':
        apiEndpoint = 'https://fal.run/fal-ai/bytedance/seedance/v1/lite/text-to-video';
        requestBody = {
          prompt: prompt || 'Create a beautiful video with smooth motion',
          duration: 5,
          aspect_ratio: '16:9',
          fps: 24
        };
        break;
      
      case 'hunyuan3d-v21':
        apiEndpoint = 'https://fal.run/fal-ai/hunyuan3d-v21';
        requestBody = {
          input_image_url: sourceImageUrl,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          octree_resolution: 256,
          textured_mesh: true
        };
        break;
      
      default:
        throw new Error(`Unsupported model: ${modelId}`);
    }

    console.log(`Making request to: ${apiEndpoint}`);
    console.log(`Request body:`, requestBody);

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${FAL_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fal API error:', errorText);
      throw new Error(`Failed to process pipeline: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Pipeline processing successful:', data);

    // Extract the output URL based on the model type
    let outputUrl = '';
    if (modelId === 'kling-video' || modelId === 'seedance-text-to-video') {
      outputUrl = data.video?.url || data.video_url || '';
    } else if (modelId === 'hunyuan3d-v21') {
      outputUrl = data.model_mesh?.url || '';
    } else {
      outputUrl = data.images?.[0]?.url || data.image?.url || '';
    }

    if (!outputUrl) {
      console.error('No output URL found in response data:', data);
      throw new Error('No output URL found in response');
    }

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
