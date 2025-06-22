import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Building } from 'lucide-react';
import { PRICING_PLANS, createPaymentIntent } from '@/services/stripe';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const PricingPlans = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (planId: string) => {
    if (!user) {
      toast.error('Please sign in to purchase credits');
      return;
    }

    setLoading(planId);
    try {
      const paymentIntent = await createPaymentIntent(planId);
      
      // Redirect to payment page with client secret
      window.location.href = `/payment?client_secret=${paymentIntent.client_secret}&plan=${planId}`;
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Failed to start payment process');
    } finally {
      setLoading(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'test': return <Zap className="h-6 w-6 text-green-500" />;
      case 'starter': return <Zap className="h-6 w-6 text-blue-500" />;
      case 'professional': return <Crown className="h-6 w-6 text-purple-500" />;
      case 'enterprise': return <Building className="h-6 w-6 text-yellow-500" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'test': return 'border-green-500';
      case 'starter': return 'border-blue-500';
      case 'professional': return 'border-purple-500 ring-2 ring-purple-500/20';
      case 'enterprise': return 'border-yellow-500';
      default: return 'border-gray-600';
    }
  };

  return (
    <div className="py-12 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Choose Your AI Credits Plan</h2>
          <p className="text-gray-400 text-lg">
            Purchase credits to generate amazing AI content with our marketplace models
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRICING_PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`bg-gray-800 ${getPlanColor(plan.id)} relative overflow-hidden`}
            >
              {plan.id === 'professional' && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              {plan.id === 'test' && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-sm font-medium">
                  Test
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center pb-2">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400 ml-2">one-time</span>
                </div>
                
                <div className="mb-6">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {plan.credits} Credits
                  </Badge>
                </div>

                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full ${
                    plan.id === 'test'
                      ? 'bg-green-600 hover:bg-green-700'
                      : plan.id === 'professional' 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading === plan.id ? 'Processing...' : `Purchase ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400">
            All plans include access to our complete AI model marketplace. 
            Credits never expire and can be used for any generation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans; 