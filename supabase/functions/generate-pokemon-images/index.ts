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

    const { pokemonType, customPrompt, modelId, count = 1 }: GenerateImageParams = await req.json();

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
      imagePromises.push(
        fetch(`https://fal.run/${actualModelId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${FAL_API_KEY}`,
          },
          body: JSON.stringify({
            prompt: prompt,
            image_size: 'square_hd',
            num_inference_steps: 4,
            guidance_scale: 3.5,
            enable_safety_checker: true,
            seed: seed
          }),
        })
      );
    }

    const responses = await Promise.all(imagePromises);
    const imageUrls = [];

    for (const response of responses) {
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fal API error:', errorText);
        throw new Error(`Failed to generate image: ${response.statusText}`);
      }

      const data = await response.json();
      imageUrls.push(data.images[0].url);
    }

    console.log(`${imageUrls.length} images generated successfully:`, imageUrls);

    return new Response(JSON.stringify({ 
      imageUrls: imageUrls,
      imageUrl: imageUrls[0] // For backward compatibility
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-pokemon-images function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
