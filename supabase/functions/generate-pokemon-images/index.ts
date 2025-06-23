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

// Model-specific parameter configurations based on FAL.ai documentation
const getModelParameters = (modelId: string, prompt: string, seed: number) => {
  console.log(`Getting parameters for model: ${modelId}`);
  
  // Google Imagen 4 models - using exact parameters from FAL.ai docs
  if (modelId.includes('imagen4')) {
    const params = {
      prompt: prompt,
      aspect_ratio: '1:1',
      num_images: 1,
      seed: seed
    };
    console.log('Imagen 4 parameters:', JSON.stringify(params, null, 2));
    return params;
  }
  
  // FLUX models - using exact parameters from FAL.ai FLUX Schnell documentation
  // Reference: https://fal.ai/models/fal-ai/flux/schnell/api
  const params = {
    prompt: prompt,
    image_size: 'square_hd',
    num_inference_steps: 4,
    seed: seed,
    sync_mode: false,
    num_images: 1,
    enable_safety_checker: true
  };
  console.log('FLUX parameters:', JSON.stringify(params, null, 2));
  return params;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Edge Function Started ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Check environment variables
    const FAL_API_KEY = Deno.env.get('FAL_API_KEY');
    const VITE_FAL_API_KEY = Deno.env.get('VITE_FAL_API_KEY'); // Fallback
    
    console.log('FAL_API_KEY exists:', !!FAL_API_KEY);
    console.log('VITE_FAL_API_KEY exists:', !!VITE_FAL_API_KEY);
    
    const apiKey = FAL_API_KEY || VITE_FAL_API_KEY;
    
    if (!apiKey) {
      console.error('❌ No FAL API key found in environment variables');
      console.log('Available env vars:', Object.keys(Deno.env.toObject()).filter(key => key.includes('FAL')));
      return new Response(
        JSON.stringify({ 
          error: 'FAL_API_KEY not configured in Edge Function environment',
          debug: {
            envVars: Object.keys(Deno.env.toObject()).filter(key => key.includes('FAL')),
            timestamp: new Date().toISOString()
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log('✅ API key found, length:', apiKey.length);
    console.log('API key prefix:', apiKey.substring(0, 8) + '...');

    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { pokemonType, customPrompt, modelId, count = 1 }: GenerateImageParams = requestBody;

    const prompts = {
      pikachu: "A cute yellow electric mouse Pokemon with red cheeks, pointed ears, and a lightning bolt tail, cartoon style, vibrant colors, high quality",
      squirtle: "A small blue turtle Pokemon with a brown shell, friendly eyes, cartoon style, vibrant colors, high quality",
      charmander: "A small orange fire lizard Pokemon with a flame on its tail, cute expression, cartoon style, vibrant colors, high quality"
    };

    let prompt = customPrompt;
    if (!prompt) {
      prompt = prompts[pokemonType as keyof typeof prompts] || `A cute ${pokemonType} Pokemon, cartoon style, vibrant colors, high quality`;
    }

    console.log(`Generating ${count} images for ${pokemonType} with prompt: ${prompt}`);
    console.log(`Model ID: ${modelId || 'default'}`);

    // Use the provided modelId or default to flux/schnell
    const actualModelId = modelId || 'fal-ai/flux/schnell';
    console.log(`Using model: ${actualModelId}`);

    // Generate multiple images with different seeds
    const imagePromises = [];
    for (let i = 0; i < count; i++) {
      const seed = Math.floor(Math.random() * 1000000);
      const modelParams = getModelParameters(actualModelId, prompt, seed);
      
      console.log(`🚀 Making API call ${i + 1}/${count} to FAL.ai`);
      console.log(`URL: https://fal.run/${actualModelId}`);
      console.log(`Request body:`, JSON.stringify({ input: modelParams }, null, 2));
      
              // Use direct HTTP fetch with correct parameters
        imagePromises.push(
          fetch(`https://fal.run/${actualModelId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Key ${apiKey}`,
            },
            body: JSON.stringify(modelParams),
          }).then(async (response) => {
          console.log(`📥 Response ${i + 1} status:`, response.status);
          console.log(`📥 Response ${i + 1} headers:`, Object.fromEntries(response.headers.entries()));
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ FAL API error for request ${i + 1}:`, errorText);
            throw new Error(`FAL API error: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log(`✅ Response ${i + 1} data:`, JSON.stringify(data, null, 2));
          return data;
        })
      );
    }

    console.log('⏳ Waiting for all API calls to complete...');
    const responses = await Promise.all(imagePromises);
    console.log('✅ All API calls completed');
    
    const imageUrls = [];

    for (let i = 0; i < responses.length; i++) {
      const data = responses[i];
      console.log(`Processing response ${i + 1}:`, JSON.stringify(data, null, 2));
      
      // Handle different response formats based on FAL.ai documentation
      if (data.images && data.images.length > 0) {
        // Imagen 4 format: { images: [{ url: "..." }], seed: 42 }
        console.log(`✅ Found images array in response ${i + 1}`);
        imageUrls.push(data.images[0].url);
      } else if (data.image) {
        // Alternative format: { image: { url: "..." } }
        console.log(`✅ Found single image in response ${i + 1}`);
        imageUrls.push(data.image.url);
      } else {
        console.error(`❌ Unexpected API response format for ${i + 1}:`, data);
        throw new Error(`Unexpected API response format for request ${i + 1}`);
      }
    }

    console.log(`🎉 ${imageUrls.length} images generated successfully:`, imageUrls);

    const result = { 
      imageUrls: imageUrls,
      imageUrl: imageUrls[0], // For backward compatibility
      debug: {
        modelUsed: actualModelId,
        promptUsed: prompt,
        timestamp: new Date().toISOString(),
        requestCount: count
      }
    };

    console.log('📤 Sending final response:', JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 Error in generate-pokemon-images function:', error);
    console.error('Error stack:', error.stack);
    
    const errorResponse = {
      error: error.message,
      debug: {
        timestamp: new Date().toISOString(),
        errorType: error.constructor.name,
        stack: error.stack
      }
    };
    
    console.log('📤 Sending error response:', JSON.stringify(errorResponse, null, 2));
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
