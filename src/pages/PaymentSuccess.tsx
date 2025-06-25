import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles } from 'lucide-react';
import { PRICING_PLANS } from '@/services/stripe';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const planId = searchParams.get('plan');

  useEffect(() => {
    const processPayment = async () => {
      const paymentIntent = searchParams.get('payment_intent');
      
      if (paymentIntent && planId) {
        try {
          // Verify payment and add credits via Edge Function
          const { data, error } = await supabase.functions.invoke('process-payment-success', {
            body: { 
              paymentIntentId: paymentIntent,
              planId 
            },
          });

          if (error) {
            console.error('Failed to process payment:', error);
            toast.error('Payment verification failed');
          } else {
            toast.success(`${data.creditsAdded} credits added to your account!`);
          }
        } catch (error) {
          console.error('Payment processing error:', error);
          toast.error('Failed to process payment');
        }
      }
      
      setIsProcessing(false);
    };

    processPayment();
  }, [searchParams, planId]);

  const plan = planId ? PRICING_PLANS[planId as keyof typeof PRICING_PLANS] : null;

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-white text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          {plan && (
            <div className="bg-gray-700 p-6 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-white font-semibold">{plan.credits} Credits Added</span>
              </div>
              <p className="text-gray-300 text-sm">
                Your {plan.name} package has been activated
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/marketplace')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Start Creating with AI
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              View Account & Credits
            </Button>
          </div>
          
          <p className="text-gray-400 text-sm">
            Thank you for your purchase! Your credits are ready to use.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess; 