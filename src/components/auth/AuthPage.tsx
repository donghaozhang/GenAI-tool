
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
            {isLogin ? 'Sign in to play Space Invaders' : 'Join the Space Invaders community'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLogin ? <LoginForm /> : <SignUpForm />}
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
