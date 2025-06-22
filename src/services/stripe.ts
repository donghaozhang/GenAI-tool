import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export const getStripe = () => stripePromise;

// Pricing plans configuration
export const PRICING_PLANS = [
  {
    id: 'test',
    name: 'Test Pack',
    credits: 10,
    price: 1.00,
    priceId: 'price_test_pack',
    description: 'Perfect for testing the payment system',
    features: ['10 AI generations', 'Test purposes only', 'Standard quality'],
    isTest: true
  },
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 9.99,
    priceId: 'price_starter_pack',
    description: 'Perfect for trying out AI generation',
    features: ['100 AI generations', 'Basic support', 'Standard quality']
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    credits: 500,
    price: 39.99,
    priceId: 'price_professional_pack',
    description: 'Best value for regular users',
    features: ['500 AI generations', 'Priority support', 'High quality', 'Batch processing'],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 2000,
    price: 149.99,
    priceId: 'price_enterprise_pack',
    description: 'For power users and businesses',
    features: ['2000 AI generations', '24/7 support', 'Highest quality', 'Advanced features', 'API access']
  }
];

// Get user credits
export const getUserCredits = async (): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return 0;
    }

    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return 0;
      }
      console.error('Error fetching user credits:', error);
      return 0;
    }

    return data?.credits || 0;
  } catch (error) {
    console.error('Error getting user credits:', error);
    return 0;
  }
};

// Consume credits for AI generation
export const consumeCredits = async (amount: number = 1): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('consume-credits', {
      body: {
        credits: amount
      }
    });

    if (error) {
      console.error('Credit consumption error:', error);
      throw new Error(error.message || 'Failed to consume credits');
    }

    return data?.success || false;
  } catch (error) {
    console.error('Error consuming credits:', error);
    throw error;
  }
};

// Create payment intent
export const createPaymentIntent = async (planId: string) => {
  try {
    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan selected');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        planId,
        amount: Math.round(plan.price * 100),
        currency: 'usd',
        credits: plan.credits
      }
    });

    if (error) {
      console.error('Payment intent creation error:', error);
      throw new Error(error.message || 'Failed to create payment intent');
    }

    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Process payment success
export const processPaymentSuccess = async (paymentIntentId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('process-payment-success', {
      body: {
        paymentIntentId
      }
    });

    if (error) {
      console.error('Payment processing error:', error);
      throw new Error(error.message || 'Failed to process payment');
    }

    return data;
  } catch (error) {
    console.error('Error processing payment success:', error);
    throw error;
  }
};

// Check if user has sufficient credits
export const checkCredits = async (required: number = 1): Promise<boolean> => {
  try {
    const currentCredits = await getUserCredits();
    return currentCredits >= required;
  } catch (error) {
    console.error('Error checking credits:', error);
    return false;
  }
};

export default {
  getStripe,
  PRICING_PLANS,
  createPaymentIntent,
  processPaymentSuccess,
  getUserCredits,
  consumeCredits,
  checkCredits
}; 