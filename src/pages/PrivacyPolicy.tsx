import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Privacy Policy</CardTitle>
            <p className="text-gray-400 text-center">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
              <p className="text-gray-300">
                When you sign in with Google, we collect your email address and basic profile information 
                (name, profile picture) to create and manage your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>To provide and maintain our AI marketplace service</li>
                <li>To authenticate your account and ensure security</li>
                <li>To personalize your experience with AI models</li>
                <li>To communicate with you about service updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Data Security</h2>
              <p className="text-gray-300">
                Your data is stored securely using Supabase's enterprise-grade security measures. 
                We do not share your personal information with third parties except as necessary 
                to provide our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
              <p className="text-gray-300">
                You have the right to access, update, or delete your personal information at any time. 
                You can also revoke access to your Google account through your Google account settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions about this Privacy Policy, please contact us at: 
                <span className="text-blue-400"> zdhpeter1991@gmail.com</span>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 