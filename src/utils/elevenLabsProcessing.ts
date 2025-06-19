
export const processVideoToSound = async (videoUrl: string): Promise<string> => {
  try {
    console.log(`Processing video to sound effects with ElevenLabs:`, videoUrl);
    
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('process-elevenlabs-video', {
      body: { 
        videoUrl: videoUrl
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to process video to sound: ${error.message}`);
    }

    if (!data?.audioUrl) {
      throw new Error('No audio URL returned from ElevenLabs processing');
    }

    console.log(`ElevenLabs video-to-sound processing completed`);
    return data.audioUrl;
  } catch (error) {
    console.error('Error processing video to sound:', error);
    throw error;
  }
};
