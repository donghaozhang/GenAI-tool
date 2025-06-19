export const processImagePipeline = async (modelId: string, sourceImageUrl?: string, prompt?: string): Promise<string> => {
  try {
    console.log(`Processing pipeline with model ${modelId}`);
    console.log(`Source image URL:`, sourceImageUrl);
    console.log(`Prompt:`, prompt);
    
    // Validate inputs
    if (!modelId) {
      throw new Error('Model ID is required');
    }
    
    const { supabase } = await import('@/integrations/supabase/client');
    
    const requestBody = { 
      modelId: modelId,
      sourceImageUrl: sourceImageUrl,
      prompt: prompt || '',
    };
    
    console.log('Sending request to Edge Function:', requestBody);
    
    const { data, error } = await supabase.functions.invoke('process-image-pipeline', {
      body: requestBody
    });

    console.log('Raw Supabase response:', { data, error });

    if (error) {
      console.error('Supabase function error details:', error);
      // Check if it's a FunctionsHttpError with more details
      if (error.message) {
        throw new Error(`Failed to process pipeline: ${error.message}`);
      } else {
        throw new Error(`Failed to process pipeline: ${JSON.stringify(error)}`);
      }
    }

    console.log('Edge Function response:', data);

    // Check if data has an error property (Edge Function returned error)
    if (data?.error) {
      console.error('Edge Function returned error:', data.error);
      throw new Error(`Pipeline processing failed: ${data.error}`);
    }

    if (!data?.outputUrl) {
      console.error('No output URL in response data:', data);
      throw new Error('No output URL returned from the pipeline function');
    }

    console.log(`Pipeline processing completed with model ${modelId}`);
    console.log(`Output URL:`, data.outputUrl);
    return data.outputUrl;
  } catch (error) {
    console.error('Error processing image pipeline:', error);
    // Add more specific error information
    if (error instanceof Error) {
      throw new Error(`Pipeline processing failed: ${error.message}`);
    } else {
      throw new Error(`Pipeline processing failed: ${JSON.stringify(error)}`);
    }
  }
};
