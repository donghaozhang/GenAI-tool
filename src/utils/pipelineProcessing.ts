
export const processImagePipeline = async (modelId: string, sourceImageUrl?: string, prompt?: string): Promise<string> => {
  try {
    console.log(`Processing pipeline with model ${modelId}`);
    if (sourceImageUrl) {
      console.log(`Source image:`, sourceImageUrl);
    }
    
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('process-image-pipeline', {
      body: { 
        modelId: modelId,
        sourceImageUrl: sourceImageUrl,
        prompt: prompt || '',
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to process pipeline: ${error.message}`);
    }

    if (!data?.outputUrl) {
      throw new Error('No output URL returned from the pipeline function');
    }

    console.log(`Pipeline processing completed with model ${modelId}`);
    return data.outputUrl;
  } catch (error) {
    console.error('Error processing image pipeline:', error);
    throw error;
  }
};
