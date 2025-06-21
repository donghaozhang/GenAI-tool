
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Mail } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

const AuthPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {isLogin ? 'Sign in to access AI Marketplace' : 'Join the AI Marketplace community'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLogin ? <LoginForm /> : <SignUpForm />}
          
          <div className="text-center space-y-3">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">Or</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => navigate('/marketplace')}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Skip Auth - Try Marketplace
            </Button>
            
            <p className="text-xs text-gray-500 mt-2">
              You can explore AI models without an account. Sign up later to save your work.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
