
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  context?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not found in environment variables');
    }

    const { message, context }: ChatRequest = await req.json();

    console.log('Processing chat request:', message);

    const systemPrompt = `You are an expert AI prompt engineer specializing in image generation prompts. Your job is to help users improve their prompts for AI image generation models like FLUX, DALL-E, and Midjourney.

When a user gives you a prompt or asks for help, you should:
1. Analyze what they want to create
2. Suggest improvements to make the prompt more specific, detailed, and effective
3. Add relevant style keywords, lighting descriptions, composition details, and technical parameters
4. Keep the improved prompt concise but descriptive
5. Explain why your suggestions will create better results

Focus on practical improvements that will lead to higher quality, more accurate image generations.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: context ? `Context: ${context}\n\nUser message: ${message}` : message }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-app-domain.com',
        'X-Title': 'AI Model Marketplace'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    console.log('ChatGPT response received');

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-gpt function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
