
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessVideoToSoundParams {
  videoUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not found in environment variables');
    }

    const { videoUrl }: ProcessVideoToSoundParams = await req.json();

    console.log(`Processing video to sound effects with ElevenLabs:`, videoUrl);

    // First, download the video file
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to download video file');
    }

    const videoBlob = await videoResponse.blob();

    // Create form data for ElevenLabs API
    const formData = new FormData();
    formData.append('video', videoBlob, 'video.mp4');
    formData.append('duration_seconds', '10');
    formData.append('prompt', 'Generate realistic sound effects that match the visual content of this video');

    console.log('Making request to ElevenLabs video-to-sfx API');

    // Use the correct ElevenLabs video-to-sfx endpoint
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Check if response is audio
    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);

    if (!contentType || !contentType.includes('audio')) {
      const responseText = await response.text();
      console.error('Unexpected response format:', responseText);
      throw new Error('Expected audio response from ElevenLabs API');
    }

    const audioBlob = await response.blob();
    console.log('ElevenLabs processing successful, audio size:', audioBlob.size);

    // Convert audio blob to base64 for easier handling
    const audioBuffer = await audioBlob.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    return new Response(JSON.stringify({ audioUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-elevenlabs-video function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
