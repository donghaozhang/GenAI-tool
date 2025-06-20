export const processBackgroundRemoval = async (imageUrl: string): Promise<string> => {
  try {
    console.log('Starting background removal process with fal-ai/imageutils/rembg...');
    
    // Get the FAL API key from environment
    const FAL_API_KEY = import.meta.env.VITE_FAL_API_KEY;
    if (!FAL_API_KEY) {
      throw new Error('FAL_API_KEY not configured. Please set VITE_FAL_API_KEY in your environment.');
    }

    // Call the fal.ai background removal API directly
    const response = await fetch('https://fal.run/fal-ai/imageutils/rembg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${FAL_API_KEY}`,
      },
      body: JSON.stringify({
        image_url: imageUrl,
        sync_mode: true, // Wait for the image to be generated and uploaded
        crop_to_bbox: false // Keep full image dimensions
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Background removal API error:', errorText);
      throw new Error(`Background removal API request failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Background removal API response:', result);

    if (!result || !result.image || !result.image.url) {
      throw new Error('Invalid response from background removal API - missing image URL');
    }

    console.log('Background removal completed successfully');
    return result.image.url;
  } catch (error) {
    console.error('Error removing background:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        throw new Error('API authentication failed. Please check your FAL_KEY configuration.');
      } else if (error.message.includes('429')) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else if (error.message.includes('500')) {
        throw new Error('Background removal service is temporarily unavailable. Please try again.');
      } else if (error.message.includes('FAL_API_KEY not configured')) {
        throw error; // Re-throw the configuration error as-is
      }
    }
    
    throw new Error(`Background removal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
