import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { config } from '@/config/env';
import { supabase } from '@/integrations/supabase/client';

const TwitterTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [environmentInfo, setEnvironmentInfo] = useState<any>({});

  useEffect(() => {
    // Gather environment information
    const envInfo = {
      mode: import.meta.env.VITE_ENV_MODE,
      configMode: config.environment.mode,
      configUrl: config.supabase.url,
      configIsLocal: config.environment.isLocal,
      configIsRemote: config.environment.isRemote,
      envVars: {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_REMOTE_URL: import.meta.env.VITE_SUPABASE_REMOTE_URL,
        VITE_SUPABASE_LOCAL_URL: import.meta.env.VITE_SUPABASE_LOCAL_URL,
        VITE_TWITTER_CLIENT_ID: import.meta.env.VITE_TWITTER_CLIENT_ID,
        VITE_TWITTER_CLIENT_SECRET: import.meta.env.VITE_TWITTER_CLIENT_SECRET ? 'Set' : 'Missing'
      }
    };
    setEnvironmentInfo(envInfo);
    
    // Check current authentication status
    checkAuthStatus();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session);
      if (session?.user) {
        setCurrentUser(session.user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setCurrentUser(user);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const runTwitterOAuthTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results: any[] = [];
    
    // Test 1: Environment Configuration
    console.log('🧪 Running Test 1: Environment Configuration');
    const configTest = {
      name: 'Environment Configuration',
      passed: config.supabase.url && config.supabase.anonKey,
      details: {
        mode: `${config.environment.mode} (${config.environment.isLocal ? 'Local' : 'Remote'})`,
        activeUrl: config.supabase.url,
        expectedUrl: config.environment.isRemote ? 'https://wdprvtqbwnhwbpufcmgg.supabase.co' : 'http://127.0.0.1:54321',
        urlMatch: config.supabase.url === (config.environment.isRemote ? 'https://wdprvtqbwnhwbpufcmgg.supabase.co' : 'http://127.0.0.1:54321') ? '✅ Correct' : '❌ Mismatch'
      }
    };
    results.push(configTest);
    setTestResults([...results]);

    // Test 2: Environment Variables
    console.log('🧪 Running Test 2: Environment Variables');
    const envTest = {
      name: 'Environment Variables',
      passed: !!(
        import.meta.env.VITE_SUPABASE_URL &&
        import.meta.env.VITE_SUPABASE_ANON_KEY &&
        import.meta.env.VITE_TWITTER_CLIENT_ID &&
        import.meta.env.VITE_TWITTER_CLIENT_SECRET
      ),
      details: {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
        twitterClientId: import.meta.env.VITE_TWITTER_CLIENT_ID ? '✅ Set' : '❌ Missing',
        twitterClientSecret: import.meta.env.VITE_TWITTER_CLIENT_SECRET ? '✅ Set' : '❌ Missing'
      }
    };
    results.push(envTest);
    setTestResults([...results]);

    // Test 3: Supabase Connection
    console.log('🧪 Running Test 3: Supabase Connection');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      results.push({
        name: 'Supabase Connection',
        passed: true,
        details: { 
          session: data.session ? 'Active' : 'None',
          endpoint: config.supabase.url,
          connectionTest: '✅ Connected successfully'
        }
      });
    } catch (error: any) {
      results.push({
        name: 'Supabase Connection',
        passed: false,
        error: error.message,
        details: {
          endpoint: config.supabase.url,
          connectionTest: '❌ Connection failed'
        }
      });
    }
    setTestResults([...results]);

    // Test 4: Current Auth Status
    console.log('🧪 Running Test 4: Current Auth Status');
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      results.push({
        name: 'Current Auth Status',
        passed: true,
        details: {
          authenticated: !!user,
          userId: user?.id || 'None',
          email: user?.email || 'None',
          provider: user?.app_metadata?.provider || 'None'
        }
      });
    } catch (error: any) {
      results.push({
        name: 'Current Auth Status',
        passed: false,
        error: error.message
      });
    }
    setTestResults([...results]);

    // Test 5: URL Callback Parameters
    console.log('🧪 Running Test 5: URL Callback Parameters');
    const urlParams = new URLSearchParams(window.location.search);
    const hasError = urlParams.get('error');
    const hasCode = urlParams.get('code');
    const hasTwitterTest = urlParams.get('twitter_test');
    
    results.push({
      name: 'URL Callback Parameters',
      passed: !hasError,
      details: {
        hasError: hasError ? `❌ ${hasError}` : '✅ No error',
        hasCode: hasCode ? '✅ Authorization code present' : 'ℹ️ No code',
        hasTwitterTest: hasTwitterTest ? '✅ Twitter test parameter' : 'ℹ️ No test parameter',
        errorDescription: urlParams.get('error_description') || 'None'
      }
    });
    setTestResults([...results]);

    setIsRunning(false);
    
    return results;
  };

  const testTwitterOAuth = async () => {
    console.log('🐦 Starting Twitter OAuth test...');
    console.log('Using Supabase URL:', config.supabase.url);
    
    try {
      // Use the exact redirect URL that's configured in Supabase dashboard
      const redirectUrl = `${window.location.origin}/twitter-test?twitter_test=true`;
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('❌ Twitter OAuth failed:', error);
        alert(`Twitter OAuth Error: ${error.message}\n\nSupabase URL: ${config.supabase.url}\nRedirect URL: ${redirectUrl}\n\nError Details: ${JSON.stringify(error, null, 2)}`);
      } else {
        console.log('✅ Twitter OAuth initiated successfully', data);
      }
    } catch (error: any) {
      console.error('❌ Twitter OAuth exception:', error);
      alert(`Twitter OAuth Exception: ${error.message}\n\nStack: ${error.stack}`);
    }
  };

  const testTwitterOAuthSimple = async () => {
    console.log('🐦 Starting Simple Twitter OAuth test...');
    console.log('Using Supabase URL:', config.supabase.url);
    
    try {
      // Simple OAuth without custom redirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter'
      });
      
      if (error) {
        console.error('❌ Simple Twitter OAuth failed:', error);
        alert(`Simple Twitter OAuth Error: ${error.message}\n\nSupabase URL: ${config.supabase.url}\n\nError Details: ${JSON.stringify(error, null, 2)}`);
      } else {
        console.log('✅ Simple Twitter OAuth initiated successfully', data);
      }
    } catch (error: any) {
      console.error('❌ Simple Twitter OAuth exception:', error);
      alert(`Simple Twitter OAuth Exception: ${error.message}\n\nStack: ${error.stack}`);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
      console.log('✅ Signed out successfully');
    } catch (error: any) {
      console.error('❌ Sign out failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">Twitter OAuth Test Suite</h1>
          <p className="text-gray-300">Comprehensive testing for Twitter OAuth integration</p>
        </div>

        {/* Environment Debug Info */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Environment Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Environment Mode:</strong> {environmentInfo.mode}</p>
                <p><strong>Config Mode:</strong> {environmentInfo.configMode}</p>
                <p><strong>Is Local:</strong> {environmentInfo.configIsLocal ? 'Yes' : 'No'}</p>
                <p><strong>Is Remote:</strong> {environmentInfo.configIsRemote ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p><strong>Active Supabase URL:</strong></p>
                <code className="text-xs bg-gray-700 p-1 rounded">{environmentInfo.configUrl}</code>
                <p className="mt-2"><strong>Expected for Remote:</strong></p>
                <code className="text-xs bg-gray-700 p-1 rounded">https://wdprvtqbwnhwbpufcmgg.supabase.co</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current User Status */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Current Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            {currentUser ? (
              <div className="space-y-2">
                <Badge variant="default" className="bg-green-600">Authenticated</Badge>
                <div className="text-sm space-y-1">
                  <p><strong>User ID:</strong> {currentUser.id}</p>
                  <p><strong>Email:</strong> {currentUser.email || 'Not provided'}</p>
                  <p><strong>Provider:</strong> {currentUser.app_metadata?.provider || 'Unknown'}</p>
                  <p><strong>Last Sign In:</strong> {new Date(currentUser.last_sign_in_at).toLocaleString()}</p>
                </div>
                <Button onClick={signOut} variant="outline" size="sm" className="mt-2">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div>
                <Badge variant="secondary">Not Authenticated</Badge>
                <p className="text-sm text-gray-400 mt-2">No active session found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Test Controls</CardTitle>
            <CardDescription>Run tests and try Twitter OAuth</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runTwitterOAuthTests} 
              disabled={isRunning}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <Button 
              onClick={testTwitterOAuth} 
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              🐦 Test Twitter OAuth
            </Button>
            
            <Button 
              onClick={testTwitterOAuthSimple} 
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              🐦 Test Simple Twitter OAuth
            </Button>
            
            <div className="text-xs text-gray-400 mt-2">
              <p>Current Supabase URL: <code>{config.supabase.url}</code></p>
              <p>Redirect URL: <code>{window.location.origin}/twitter-test?twitter_test=true</code></p>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Test Results</CardTitle>
              <CardDescription>
                {testResults.filter(r => r.passed).length}/{testResults.length} tests passed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{result.name}</h3>
                    <Badge variant={result.passed ? "default" : "destructive"}>
                      {result.passed ? '✅ Pass' : '❌ Fail'}
                    </Badge>
                  </div>
                  
                  {result.error && (
                    <Alert className="mb-2">
                      <AlertDescription className="text-red-400">
                        Error: {result.error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {result.details && (
                    <div className="text-sm space-y-1">
                      {Object.entries(result.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-gray-300">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Troubleshooting Tips */}
        <Card className="mt-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Troubleshooting Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-300">
            <p>1. <strong>Check Supabase Dashboard:</strong> Auth → Providers → Twitter</p>
            <p>2. <strong>Verify Twitter App:</strong> Ensure OAuth 2.0 is enabled</p>
            <p>3. <strong>Check Redirect URIs:</strong> Must match in Twitter app settings</p>
            <p>4. <strong>Environment Variables:</strong> All required vars must be set</p>
            <p>5. <strong>Console Logs:</strong> Check browser console for detailed errors</p>
            <p>6. <strong>URL Mismatch:</strong> Ensure you're using the correct Supabase URL for your environment</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TwitterTest; 