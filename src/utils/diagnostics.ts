// Diagnostic utilities for troubleshooting pipeline issues

export const testEdgeFunction = async () => {
  try {
    console.log('Testing Edge Function with minimal parameters...');
    
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Test with a simple text-to-video model that doesn't require an image
    const testRequest = {
      modelId: 'fal-ai/bytedance/seedance/v1/lite/text-to-video',
      prompt: 'test'
    };
    
    console.log('Sending test request:', testRequest);
    
    const { data, error } = await supabase.functions.invoke('process-image-pipeline', {
      body: testRequest
    });
    
    console.log('Test response:', { data, error });
    
    if (error) {
      console.error('Edge Function test failed:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Test function error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const validateImageUrl = (imageUrl: string): boolean => {
  try {
    const url = new URL(imageUrl);
    // Check if it's a valid HTTP/HTTPS URL
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const testImageAccess = async (imageUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}; 