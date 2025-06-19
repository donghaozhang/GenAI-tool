
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && user) {
      // Redirect authenticated users directly to the AI marketplace
      navigate('/marketplace');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-5xl font-bold text-white mb-4">GenAI-tool</h1>
          <p className="text-gray-300 text-lg">AI Model Marketplace</p>
          <p className="text-gray-400">Discover and use cutting-edge AI models with pipeline capabilities</p>
          <div className="flex flex-col gap-4 mt-8">
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Get Started
            </Button>
            <Button 
              onClick={() => navigate('/marketplace')}
              variant="outline"
              className="border-gray-400 text-gray-300 hover:bg-gray-800 px-8 py-3"
            >
              Browse AI Models
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // This should not be reached due to the useEffect redirect, but just in case
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Redirecting to AI Marketplace...</div>
    </div>
  );
};

export default Index;
