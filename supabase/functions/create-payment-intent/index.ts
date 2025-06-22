import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get user from auth
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User authenticated:', user.id)

    const requestBody = await req.json()
    console.log('Request body:', requestBody)
    
    const { amount, currency = 'usd', planId, credits } = requestBody

    // Validate required fields
    if (!amount || !planId || !credits) {
      console.error('Missing required fields:', { amount, planId, credits })
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, planId, credits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if Stripe secret key is available
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    
    console.log('Stripe key available:', stripeSecretKey ? 'Yes' : 'No')
    console.log('Stripe key value:', stripeSecretKey?.substring(0, 20) + '...')
    
    if (!stripeSecretKey || stripeSecretKey === '') {
      console.error('STRIPE_SECRET_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ error: 'Stripe configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if this is the example test key - if so, create a mock response
    if (stripeSecretKey === 'sk_test_' + '4eC39HqLyjWDarjtT1zdp7dc') {
      console.log('Using mock payment system for testing')
      
      // Create a mock payment intent response
      const mockPaymentIntent = {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
        amount,
        currency,
        status: 'requires_payment_method',
        metadata: {
          userId: user.id,
          planId,
          credits: credits.toString(),
        }
      }

      console.log('Mock payment intent created:', mockPaymentIntent.id)

      return new Response(
        JSON.stringify({
          id: mockPaymentIntent.id,
          client_secret: mockPaymentIntent.client_secret,
          amount: mockPaymentIntent.amount,
          currency: mockPaymentIntent.currency,
          status: mockPaymentIntent.status,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    console.log('Initializing Stripe with key length:', stripeSecretKey.length)
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    console.log('Creating payment intent with params:', {
      amount,
      currency,
      userId: user.id,
      planId,
      credits
    })

    // Create payment intent
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: user.id,
          planId,
          credits: credits.toString(),
        },
      })

      console.log('Payment intent created successfully:', paymentIntent.id)

      return new Response(
        JSON.stringify({
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError)
      return new Response(
        JSON.stringify({ 
          error: 'Stripe API error',
          details: stripeError.message || 'Unknown Stripe error'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message || 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 