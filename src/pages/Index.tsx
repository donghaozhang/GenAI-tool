import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { config } from '@/config/env';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Debug: Test Supabase connection
    console.log('🔧 Debug: Supabase Config:', {
      url: config.supabase.url,
      anonKey: config.supabase.anonKey?.substring(0, 20) + '...',
      mode: config.environment.mode
    });

    // Test basic Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('🔧 Debug: Auth session test:', { data, error });
      } catch (err) {
        console.error('🔧 Debug: Connection error:', err);
      }
    };

    testConnection();

    // Redirect to marketplace for all users (authenticated and unauthenticated)
    if (!loading) {
      navigate('/marketplace');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600/20 p-4 rounded-full">
                <Sparkles className="h-12 w-12 text-blue-400" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-4">marketartAI</h1>
            <p className="text-gray-300 text-lg">AI-Powered Creative Marketplace</p>
            <p className="text-gray-400 text-base mt-2 max-w-2xl mx-auto">
              Discover, create, and share amazing AI-generated content with cutting-edge models and tools
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <Zap className="h-8 w-8 text-yellow-400 mb-4 mx-auto" />
              <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">Generate high-quality content in seconds with optimized AI models</p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <Users className="h-8 w-8 text-green-400 mb-4 mx-auto" />
              <h3 className="text-white font-semibold mb-2">Community Driven</h3>
              <p className="text-gray-400 text-sm">Join thousands of creators sharing and discovering AI art</p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <Sparkles className="h-8 w-8 text-purple-400 mb-4 mx-auto" />
              <h3 className="text-white font-semibold mb-2">Creative Freedom</h3>
              <p className="text-gray-400 text-sm">Access diverse AI models for unlimited creative possibilities</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-gray-500 text-sm">Sign up free and start creating today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
