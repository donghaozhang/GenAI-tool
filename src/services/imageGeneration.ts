import { supabase } from '@/integrations/supabase/client';

export interface GenerateImageParams {
  prompt: string;
  image_size?: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
  num_inference_steps?: number;
  guidance_scale?: number;
  count?: number;
}

export interface PokemonType {
  id: string;
  name: string;
  color: string;
  description: string;
}

export const pokemonTypes: PokemonType[] = [
  { id: 'pikachu', name: 'Pikachu', color: 'bg-yellow-500', description: 'Electric mouse Pokemon' },
  { id: 'squirtle', name: 'Squirtle', color: 'bg-blue-500', description: 'Water turtle Pokemon' },
  { id: 'charmander', name: 'Charmander', color: 'bg-red-500', description: 'Fire lizard Pokemon' },
  { id: 'bulbasaur', name: 'Bulbasaur', color: 'bg-green-500', description: 'Grass/poison Pokemon' },
  { id: 'eevee', name: 'Eevee', color: 'bg-amber-600', description: 'Evolution Pokemon' },
  { id: 'meowth', name: 'Meowth', color: 'bg-orange-400', description: 'Scratch cat Pokemon' },
  { id: 'psyduck', name: 'Psyduck', color: 'bg-yellow-400', description: 'Duck Pokemon' },
  { id: 'jigglypuff', name: 'Jigglypuff', color: 'bg-pink-400', description: 'Balloon Pokemon' },
];

export const generatePokemonImage = async (pokemonType: string, customPrompt?: string, count: number = 1): Promise<string[]> => {
  try {
    console.log(`Generating ${count} Pokemon images for ${pokemonType}...`);
    
    const { data, error } = await supabase.functions.invoke('generate-pokemon-images', {
      body: { 
        pokemonType,
        customPrompt,
        count
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to generate Pokemon images: ${error.message}`);
    }

    if (!data?.imageUrls && !data?.imageUrl) {
      throw new Error('No image URLs returned from the function');
    }

    const imageUrls = data.imageUrls || [data.imageUrl];
    console.log(`${imageUrls.length} Pokemon images generated successfully`);
    return imageUrls;
  } catch (error) {
    console.error('Error generating Pokemon images:', error);
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
      } else if (modelId.includes('minimax/hailuo-02')) {
        generationPrompt = 'A person walking through a beautiful winter landscape with falling snow';
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
