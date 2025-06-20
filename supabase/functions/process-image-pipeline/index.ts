import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ProcessImagePipelineParams {
  modelId: string;
  sourceImageUrl?: string;
  prompt?: string;
}

interface StatusCheckParams {
  action: 'status';
  statusUrl: string;
}

interface ResultFetchParams {
  action: 'result';
  responseUrl: string;
}

// Helper function to validate image URL
const isValidImageUrl = (url: string): boolean => {
  // Check for data URLs (base64 encoded images)
  if (url.startsWith('data:image/')) {
    return true;
  }
  
  // Check for HTTP/HTTPS URLs
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    // Check for required environment variables
    const FAL_API_KEY = Deno.env.get('FAL_API_KEY');
    if (!FAL_API_KEY) {
      console.error('FAL_API_KEY environment variable not set');
      return new Response(
        JSON.stringify({ error: 'FAL_API_KEY not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    const requestBody = await req.json();
    
    // Add a test endpoint to verify API key configuration
    if (requestBody.action === 'test') {
      return new Response(
        JSON.stringify({ 
          status: 'success',
          success: true, 
          message: 'FAL_API_KEY is configured',
          keyLength: FAL_API_KEY.length,
          keyPrefix: FAL_API_KEY.substring(0, 8) + '...'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      );
    }
    
    // Check if this is a status check request with exact URL
    if (requestBody.action === 'status' && requestBody.statusUrl) {
      return await handleStatusCheckWithUrl(requestBody.statusUrl, FAL_API_KEY);
    }
    
    // Check if this is a result fetch request with exact URL
    if (requestBody.action === 'result' && requestBody.responseUrl) {
      return await handleResultFetchWithUrl(requestBody.responseUrl, FAL_API_KEY);
    }

    const { modelId, sourceImageUrl, prompt }: ProcessImagePipelineParams = requestBody;

    console.log(`Processing pipeline for model: ${modelId}`);
    console.log(`Source image URL provided: ${!!sourceImageUrl}`);
    console.log(`Prompt: ${prompt}`);

    // Validate inputs
    if (!modelId) {
      return new Response(
        JSON.stringify({ error: 'Model ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    if (sourceImageUrl && !isValidImageUrl(sourceImageUrl)) {
      return new Response(
        JSON.stringify({ error: 'Invalid image URL format' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // Build the input for the FAL model
    const input: any = {};
    
    if (prompt) {
      input.prompt = prompt;
    }

    // Add image/video URL for different model types
    if (sourceImageUrl) {
      if (modelId.includes('mmaudio-v2')) {
        // MMAudio V2 expects video_url parameter
        input.video_url = sourceImageUrl;
      } else if (modelId.includes('flux-pro/kontext')) {
        // FLUX Pro Kontext uses image_url
        input.image_url = sourceImageUrl;
      } else {
        // Default for most image-to-image and image-to-video models
        input.image_url = sourceImageUrl;
      }
    }

    // Add model-specific parameters
    if (modelId.includes('minimax/hailuo-02')) {
      // MiniMax Hailuo 02 specific parameters
      input.duration = "6"; // Default to 6 seconds
      input.prompt_optimizer = true; // Enable prompt optimization by default
    } else if (modelId.includes('mmaudio-v2')) {
      // MMAudio V2 specific parameters
      input.duration = 8; // Default duration in seconds
      input.num_steps = 25; // Default number of steps
      input.cfg_strength = 4.5; // Default CFG strength
      if (!prompt) {
        input.prompt = "Cinematic background music with emotional depth and atmospheric ambiance";
      }
    }

    console.log(`Making request to FAL queue with model: ${modelId}`);
    console.log(`Input payload:`, JSON.stringify(input, null, 2));

    // Make request to FAL queue API
    const falResponse = await fetch(`https://queue.fal.run/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    console.log(`FAL API response status: ${falResponse.status}`);

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      console.error(`FAL API error: ${errorText}`);
      return new Response(
        JSON.stringify({ 
          error: `FAL API request failed with status ${falResponse.status}`,
          details: errorText
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    const queueResult = await falResponse.json();
    console.log('FAL queue submission successful:', queueResult);

    // The queue API returns a request_id and exact status URLs
    // Return these exact URLs to be used by the client
    return new Response(
      JSON.stringify({
        success: true,
        requestId: queueResult.request_id,
        statusUrl: queueResult.status_url,
        responseUrl: queueResult.response_url,
        message: 'Request submitted to FAL queue successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});

// Helper function to check status using exact URL from FAL
async function handleStatusCheckWithUrl(statusUrl: string, apiKey: string) {
  try {
    console.log(`Checking status at URL: ${statusUrl}`);
    console.log(`Using API key: ${apiKey.substring(0, 8)}...`);
    
    const statusResponse = await fetch(statusUrl, {
      headers: {
        'Authorization': `Key ${apiKey}`,
      },
    });

    console.log(`Status response status: ${statusResponse.status}`);
    console.log(`Status response headers:`, [...statusResponse.headers.entries()]);

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error(`Status check failed: ${statusResponse.status}`);
      console.error(`Status check error details: ${errorText}`);
      
      // Return more detailed error information
      return new Response(
        JSON.stringify({ 
          error: `Status check failed: ${statusResponse.status}`, 
          details: errorText,
          url: statusUrl,
          apiKeyPrefix: apiKey.substring(0, 8) + '...'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: statusResponse.status 
        }
      );
    }

    const statusData = await statusResponse.json();
    console.log('Status check successful:', statusData);
    
    return new Response(
      JSON.stringify(statusData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error checking status:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to check status', 
        details: error.message,
        url: statusUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
}

// Helper function to fetch results using exact URL from FAL
async function handleResultFetchWithUrl(responseUrl: string, apiKey: string) {
  try {
    console.log(`Fetching result at URL: ${responseUrl}`);
    
    const resultResponse = await fetch(responseUrl, {
      headers: {
        'Authorization': `Key ${apiKey}`,
      },
    });

    if (!resultResponse.ok) {
      console.error(`Result fetch failed: ${resultResponse.status}`);
      const errorText = await resultResponse.text();
      console.error(`Result fetch error details: ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Result fetch failed: ${resultResponse.status}`, details: errorText }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: resultResponse.status 
        }
      );
    }

    const resultData = await resultResponse.json();
    console.log('Result fetch successful:', resultData);
    
    return new Response(
      JSON.stringify(resultData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error fetching result:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch result', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
}
