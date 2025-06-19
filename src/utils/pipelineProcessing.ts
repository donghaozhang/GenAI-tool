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
    
    // Step 1: Submit the request to the queue
    const { data, error } = await supabase.functions.invoke('process-image-pipeline', {
      body: requestBody
    });

    console.log('Raw Supabase response:', { data, error });

    if (error) {
      console.error('Supabase function error details:', error);
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

    if (!data?.success || !data?.requestId || !data?.statusUrl || !data?.responseUrl) {
      console.error('Invalid queue response data:', data);
      throw new Error('Invalid response from the pipeline function - missing required URLs');
    }

    console.log(`Request submitted successfully. Request ID: ${data.requestId}`);
    console.log(`Status URL: ${data.statusUrl}`);
    console.log(`Response URL: ${data.responseUrl}`);
    
    // Step 2: Poll the status until completion using exact URLs from FAL
    const maxAttempts = 60; // 5 minutes maximum wait time
    const pollInterval = 5000; // 5 seconds between polls
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      console.log(`Polling status (attempt ${attempt + 1}/${maxAttempts})...`);
      
      try {
        // Use Edge Function to check status with the exact URL from FAL
        const { data: statusResponse, error: statusError } = await supabase.functions.invoke('process-image-pipeline', {
          body: {
            action: 'status',
            statusUrl: data.statusUrl  // Pass the exact URL from FAL
          }
        });
        
        if (statusError) {
          console.error(`Status check failed:`, statusError);
          continue; // Try again
        }
        
        console.log('Status data:', statusResponse);
        
        if (statusResponse.status === 'COMPLETED') {
          console.log('Request completed! Fetching results...');
          
          // Step 3: Get the final result using exact URL from FAL
          const { data: resultData, error: resultError } = await supabase.functions.invoke('process-image-pipeline', {
            body: {
              action: 'result',
              responseUrl: data.responseUrl  // Pass the exact URL from FAL
            }
          });
          
          if (resultError) {
            throw new Error(`Failed to fetch results: ${JSON.stringify(resultError)}`);
          }
          
          console.log('Result data:', resultData);
          
          // Extract the output URL from the response
          let outputUrl = '';
          
          if (resultData.images?.[0]?.url) {
            outputUrl = resultData.images[0].url;
          } else if (resultData.image?.url) {
            outputUrl = resultData.image.url;
          } else if (resultData.video?.url) {
            outputUrl = resultData.video.url;
          } else if (resultData.url) {
            outputUrl = resultData.url;
          }
          
          if (!outputUrl) {
            console.error('No output URL found in result:', resultData);
            throw new Error('No output URL found in the completed result');
          }
          
          console.log(`Pipeline processing completed with model ${modelId}`);
          console.log(`Output URL:`, outputUrl);
          return outputUrl;
        } else if (statusResponse.status === 'ERROR') {
          console.error('Request failed:', statusResponse);
          throw new Error(`Pipeline processing failed: ${statusResponse.error || 'Unknown error'}`);
        } else if (statusResponse.status === 'IN_QUEUE' || statusResponse.status === 'IN_PROGRESS') {
          console.log(`Request status: ${statusResponse.status}${statusResponse.queue_position ? ` (position: ${statusResponse.queue_position})` : ''}`);
          
          // Wait before next poll
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        } else {
          console.warn(`Unknown status: ${statusResponse.status}`);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        }
      } catch (pollError) {
        console.error(`Error during status poll attempt ${attempt + 1}:`, pollError);
        
        if (attempt === maxAttempts - 1) {
          throw new Error(`Timeout waiting for pipeline completion after ${maxAttempts} attempts`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    throw new Error(`Timeout waiting for pipeline completion after ${maxAttempts} attempts`);
    
  } catch (error) {
    console.error('Error processing image pipeline:', error);
    if (error instanceof Error) {
      throw new Error(`Pipeline processing failed: ${error.message}`);
    } else {
      throw new Error(`Pipeline processing failed: ${JSON.stringify(error)}`);
    }
  }
};
