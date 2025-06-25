import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleIcon } from '@/components/ui/google-icon';
import { useToast } from '@/hooks/use-toast';

const GoogleOAuthTest = () => {
  const { signInWithProvider, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testGoogleOAuth = async () => {
    setLoading(true);
    addTestResult('🚀 Starting Google OAuth test...');
    
    try {
      addTestResult('📡 Calling signInWithProvider("google")...');
      
      const { error } = await signInWithProvider('google');
      
      if (error) {
        addTestResult(`❌ Error from signInWithProvider: ${error.message}`);
        toast({
          title: 'OAuth Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        addTestResult('✅ signInWithProvider completed without error');
        addTestResult('🔄 Should redirect to Google OAuth now...');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addTestResult(`💥 Exception caught: ${errorMessage}`);
      toast({
        title: 'Exception',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Google OAuth Test Page</CardTitle>
            <p className="text-gray-400 text-center">
              Debug and test Google OAuth integration
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current User Status */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">Current User Status:</h3>
              {user ? (
                <div className="text-green-400">
                  ✅ Logged in as: {user.email}
                  <br />
                  User ID: {user.id}
                </div>
              ) : (
                <div className="text-yellow-400">⚠️ Not logged in</div>
              )}
            </div>

            {/* Test Button */}
            <div className="text-center">
              <Button
                onClick={testGoogleOAuth}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                <GoogleIcon className="mr-2" />
                {loading ? 'Testing Google OAuth...' : 'Test Google OAuth'}
              </Button>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Test Results:</h3>
                  <Button
                    onClick={clearResults}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300"
                  >
                    Clear
                  </Button>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg max-h-64 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono mb-1">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configuration Info */}
            <div className="p-4 bg-gray-800 rounded-lg text-sm">
              <h3 className="font-semibold mb-2">Configuration Info:</h3>
              <div className="space-y-1 text-gray-300">
                <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</div>
                <div>Environment Mode: {import.meta.env.VITE_ENV_MODE}</div>
                <div>Current URL: {window.location.origin}</div>
                <div>Google Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID}</div>
              </div>
            </div>

            {/* Expected Flow */}
            <div className="p-4 bg-gray-800 rounded-lg text-sm">
              <h3 className="font-semibold mb-2">Expected OAuth Flow:</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-300">
                <li>Click "Test Google OAuth" button</li>
                <li>Browser redirects to accounts.google.com</li>
                <li>User signs in with Google account</li>
                <li>Google redirects back to Supabase callback</li>
                <li>Supabase processes the auth code</li>
                <li>User is redirected back to this app</li>
                <li>User status shows as logged in</li>
              </ol>
            </div>

            {/* Troubleshooting */}
            <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-sm">
              <h3 className="font-semibold mb-2 text-red-400">Common Issues:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li><strong>invalid_client:</strong> Check Google Cloud Console "Authorized JavaScript origins" and "Authorized domains"</li>
                <li><strong>redirect_uri_mismatch:</strong> Verify redirect URIs in Google Cloud Console</li>
                <li><strong>access_denied:</strong> User cancelled or app not verified in Google</li>
                <li><strong>No redirect:</strong> Check Supabase auth provider configuration</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoogleOAuthTest; 