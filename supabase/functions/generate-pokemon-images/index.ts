// Version 3.0 - Simplified and Reliable Implementation
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateImageParams {
  pokemonType: string;
  customPrompt?: string;
  modelId?: string;
  count?: number;
}

// Model-specific parameter configurations
const getModelParameters = (modelId: string, prompt: string, seed: number) => {
  console.log(`Getting parameters for model: ${modelId}`);
  
  // Google Imagen 4 models
  if (modelId.includes('imagen4')) {
    return {
      prompt: prompt,
      aspect_ratio: '1:1',
      num_images: 1,
      seed: seed
    };
  }
  
  // FLUX models - default
  return {
    prompt: prompt,
    image_size: 'square_hd',
    num_inference_steps: 4,
    seed: seed,
    sync_mode: false,
    num_images: 1,
    enable_safety_checker: true
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Edge Function v3.0 Started ===');
    
    // Check API key
    const FAL_API_KEY = Deno.env.get('FAL_API_KEY');
    if (!FAL_API_KEY) {
      console.error('❌ No FAL API key found');
      return new Response(
        JSON.stringify({ error: 'FAL_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ API key found, length:', FAL_API_KEY.length);

    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { pokemonType, customPrompt, modelId, count = 1 }: GenerateImageParams = requestBody;

    // Generate prompt
    let prompt = customPrompt || `A cute ${pokemonType} Pokemon, cartoon style, vibrant colors, high quality`;
    const actualModelId = modelId || 'fal-ai/flux/schnell';
    
    console.log(`Generating with model: ${actualModelId}`);
    console.log(`Prompt: ${prompt}`);

    // Generate single image for simplicity
    const seed = Math.floor(Math.random() * 1000000);
    const modelParams = getModelParameters(actualModelId, prompt, seed);
    
    console.log('Model parameters:', JSON.stringify(modelParams, null, 2));
    console.log('Making request to:', `https://fal.run/${actualModelId}`);

    // Make API call
    const response = await fetch(`https://fal.run/${actualModelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${FAL_API_KEY}`,
      },
      body: JSON.stringify(modelParams),
    });

    console.log('FAL API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FAL API error:', errorText);
      return new Response(
        JSON.stringify({ error: `FAL API error: ${response.status}`, details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('FAL API response:', JSON.stringify(data, null, 2));
    
    // Extract image URL
    let imageUrl = '';
    if (data.images && data.images.length > 0) {
      imageUrl = data.images[0].url;
    } else if (data.image) {
      imageUrl = data.image.url;
    } else {
      console.error('Unexpected response format:', data);
      return new Response(
        JSON.stringify({ error: 'Unexpected API response format', details: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Image generated successfully:', imageUrl);

    const result = { 
      imageUrls: [imageUrl],
      imageUrl: imageUrl,
      debug: {
        modelUsed: actualModelId,
        promptUsed: prompt,
        timestamp: new Date().toISOString()
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in generate-pokemon-images function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        debug: {
          timestamp: new Date().toISOString(),
          errorType: error.constructor.name
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
