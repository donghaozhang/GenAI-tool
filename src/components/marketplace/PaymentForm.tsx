import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';

interface PaymentFormProps {
  planId: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ planId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      // Check if this is a mock payment (client_secret contains 'mock')
      const clientSecret = new URLSearchParams(window.location.search).get('client_secret');
      
      if (clientSecret?.includes('mock')) {
        console.log('Processing mock payment for testing');
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful payment
        toast.success('Mock payment successful! Redirecting...');
        
        // Redirect to success page
        setTimeout(() => {
          navigate(`/payment/success?plan=${planId}&mock=true`);
        }, 1000);
        
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?plan=${planId}`,
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        toast.error(error.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{
          layout: 'tabs'
        }}
      />
      
      <div className="bg-gray-700 p-4 rounded-lg">
        <div className="flex items-center text-gray-300 text-sm">
          <Shield className="h-4 w-4 mr-2" />
          Your payment is secured by Stripe. We never store your card details.
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          'Complete Payment'
        )}
      </Button>
    </form>
  );
};

export default PaymentForm; 