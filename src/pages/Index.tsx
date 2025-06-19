
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SpaceInvaders from '../components/SpaceInvaders';
import { UserProfile } from '../components/UserProfile';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-white mb-4">Space Invaders</h1>
          <p className="text-gray-400 text-lg">Sign in to start playing!</p>
          <div className="flex gap-4">
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Button>
            <Button 
              onClick={() => navigate('/marketplace')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              View AI Marketplace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute top-4 right-4 z-10 flex gap-4">
        <Button 
          onClick={() => navigate('/marketplace')}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          AI Marketplace
        </Button>
        <UserProfile />
      </div>
      <div className="flex items-center justify-center min-h-screen">
        <SpaceInvaders />
      </div>
    </div>
  );
};

export default Index;
