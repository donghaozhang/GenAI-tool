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
      } else if (modelId.includes('bytedance/seedream')) {
        generationPrompt = 'A photorealistic portrait of a person with cinematic lighting and exceptional detail';
      } else if (modelId.includes('luma-photon/reframe')) {
        generationPrompt = 'Extend this image to create a wider cinematic composition with seamless blending';
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

export interface BatchGenerationResult {
  modelId: string;
  modelTitle: string;
  success: boolean;
  imageUrls?: string[];
  error?: string;
  duration?: number;
}

export const generateImagesBatch = async (
  models: { id: string; categoryLabel: string }[], 
  prompt: string, 
  count: number = 1,
  imageDataUrl?: string
): Promise<BatchGenerationResult[]> => {
  console.log(`Starting batch generation for ${models.length} models...`);
  
  const startTime = Date.now();
  const promises = models.map(async (model): Promise<BatchGenerationResult> => {
    const modelStartTime = Date.now();
    try {
      let imageUrls: string[];
      
      // Check if this is an image-to-video or image-to-image model
      if ((model.categoryLabel === 'Image to Video' || model.categoryLabel === 'Image to Image') && imageDataUrl) {
        // Use pipeline processing for image-to-video/image-to-image models
        const { processImagePipeline } = await import('@/utils/pipelineProcessing');
        const outputUrl = await processImagePipeline(model.id, imageDataUrl, prompt);
        imageUrls = [outputUrl];
      } else {
        // Use standard generation for text-to-image models
        imageUrls = await generateImageWithModel(model.id, prompt, count);
      }
      
      const duration = Date.now() - modelStartTime;
      
      return {
        modelId: model.id,
        modelTitle: model.id, // Will be enhanced with actual model title
        success: true,
        imageUrls,
        duration
      };
    } catch (error) {
      const duration = Date.now() - modelStartTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        modelId: model.id,
        modelTitle: model.id,
        success: false,
        error: errorMessage,
        duration
      };
    }
  });

  const results = await Promise.allSettled(promises);
  const batchResults = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        modelId: models[index].id,
        modelTitle: models[index].id,
        success: false,
        error: result.reason?.message || 'Promise rejected',
        duration: 0
      };
    }
  });

  const totalDuration = Date.now() - startTime;
  const successCount = batchResults.filter(r => r.success).length;
  console.log(`Batch generation completed: ${successCount}/${models.length} successful in ${totalDuration}ms`);
  
  return batchResults;
};
