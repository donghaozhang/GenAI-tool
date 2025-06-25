import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getStripe, PRICING_PLANS } from '@/services/stripe';
import PaymentForm from '@/components/marketplace/PaymentForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);

  useEffect(() => {
    const secret = searchParams.get('client_secret');
    const plan = searchParams.get('plan');
    
    console.log('Payment page - URL params:', { secret: secret?.substring(0, 20) + '...', plan });
    
    if (secret && plan) {
      setClientSecret(secret);
      setPlanId(plan);
      console.log('Payment page - Set client secret and plan ID');
    } else {
      console.log('Payment page - Missing params, redirecting to marketplace');
      // Redirect back if no payment intent
      navigate('/marketplace');
    }
  }, [searchParams, navigate]);

  const plan = planId ? PRICING_PLANS.find(p => p.id === planId) : null;
  
  console.log('Payment page - Plan lookup:', { planId, plan: plan ? plan.name : 'not found', allPlans: PRICING_PLANS.map(p => p.id) });

  if (!clientSecret || !plan) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading payment...</div>
      </div>
    );
  }

  const stripePromise = getStripe();

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/marketplace')}
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Plan</span>
                <span className="text-white font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Credits</span>
                <span className="text-white font-medium">{plan.credits} credits</span>
              </div>
              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total</span>
                  <span className="text-white font-bold text-xl">${plan.price}</span>
                </div>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg mt-4">
                <h4 className="text-white font-medium mb-2">What you get:</h4>
                <ul className="space-y-1 text-gray-300 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#3b82f6',
                      colorBackground: '#1f2937',
                      colorText: '#ffffff',
                      colorDanger: '#ef4444',
                      fontFamily: 'system-ui, sans-serif',
                      spacingUnit: '4px',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <PaymentForm planId={planId} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment; 