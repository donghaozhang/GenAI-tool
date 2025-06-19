import { supabase } from '@/integrations/supabase/client';

export interface GenerateImageParams {
  prompt: string;
  image_size?: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
  num_inference_steps?: number;
  guidance_scale?: number;
  count?: number;
}

export const generatePokemonImage = async (pokemonType: string): Promise<string> => {
  try {
    console.log(`Generating image for ${pokemonType}...`);
    
    const { data, error } = await supabase.functions.invoke('generate-pokemon-images', {
      body: { pokemonType }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }

    if (!data?.imageUrl) {
      throw new Error('No image URL returned from the function');
    }

    console.log(`Image generated successfully for ${pokemonType}`);
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating Pokemon image:', error);
    throw error;
  }
};

export const generateImageWithModel = async (modelId: string, prompt?: string, count: number = 1): Promise<string[]> => {
  try {
    console.log(`Generating ${count} images with model ${modelId}...`);
    
    // Create a prompt based on the model type if none provided
    let generationPrompt = prompt;
    if (!generationPrompt) {
      if (modelId.includes('flux')) {
        generationPrompt = 'A beautiful landscape with vibrant colors and stunning details';
      } else if (modelId.includes('imagen')) {
        generationPrompt = 'A modern abstract artwork with geometric patterns';
      } else if (modelId.includes('kling')) {
        generationPrompt = 'A serene nature scene with mountains and water';
      } else {
        generationPrompt = 'A creative digital artwork showcasing AI capabilities';
      }
    }
    
    const { data, error } = await supabase.functions.invoke('generate-pokemon-images', {
      body: { 
        pokemonType: 'custom',
        customPrompt: generationPrompt,
        modelId: modelId,
        count: count
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to generate images: ${error.message}`);
    }

    if (!data?.imageUrls && !data?.imageUrl) {
      throw new Error('No image URLs returned from the function');
    }

    // Handle both single and multiple image responses
    const imageUrls = data.imageUrls || [data.imageUrl];
    console.log(`${imageUrls.length} images generated successfully with model ${modelId}`);
    return imageUrls;
  } catch (error) {
    console.error('Error generating images with model:', error);
    throw error;
  }
};

export const generateAllPokemonImages = async (): Promise<Record<string, string>> => {
  const pokemonTypes = ['pikachu', 'squirtle', 'charmander'];
  const images: Record<string, string> = {};

  for (const type of pokemonTypes) {
    try {
      images[type] = await generatePokemonImage(type);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to generate ${type} image:`, error);
    }
  }

  return images;
};
