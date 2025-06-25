import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { amount = 1 } = await req.json()

    // Get current credits
    const { data: currentCredits, error: fetchError } = await supabaseClient
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching credits:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const availableCredits = currentCredits?.credits || 0

    if (availableCredits < amount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Insufficient credits',
          available: availableCredits,
          required: amount
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Consume credits
    const { error: updateError } = await supabaseClient
      .from('user_credits')
      .update({ 
        credits: availableCredits - amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error consuming credits:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to consume credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        creditsRemaining: availableCredits - amount,
        creditsConsumed: amount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error consuming credits:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 