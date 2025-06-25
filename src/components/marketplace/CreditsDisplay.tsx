import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Plus, Zap } from 'lucide-react';
import { getUserCredits } from '@/services/stripe';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreditsDisplay = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      if (user) {
        try {
          const userCredits = await getUserCredits();
          setCredits(userCredits);
        } catch (error) {
          console.error('Failed to fetch credits:', error);
        }
      }
      setLoading(false);
    };

    fetchCredits();
  }, [user]);

  const handlePurchaseCredits = () => {
    navigate('/pricing');
  };

  if (!user) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-gray-300">Sign in to track credits</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Coins className="h-5 w-5 text-yellow-400 mr-2" />
            <div>
              <span className="text-white font-medium">
                {loading ? 'Loading...' : `${credits} Credits`}
              </span>
              <p className="text-gray-400 text-xs">Available for AI generation</p>
            </div>
          </div>
          
          <Button
            size="sm"
            onClick={handlePurchaseCredits}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Buy More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditsDisplay; 