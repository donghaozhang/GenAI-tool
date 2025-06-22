import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Terms of Service</CardTitle>
            <p className="text-gray-400 text-center">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
              <p className="text-gray-300">
                By accessing and using MarketArtAI, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Service Description</h2>
              <p className="text-gray-300">
                MarketArtAI is an AI marketplace that provides access to various artificial intelligence 
                models for image generation, processing, and other AI-powered services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">User Accounts</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must not share your account credentials with others</li>
                <li>We reserve the right to suspend accounts that violate these terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Acceptable Use</h2>
              <p className="text-gray-300 mb-3">You agree not to use our service to:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Generate illegal, harmful, or offensive content</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Attempt to reverse engineer or compromise our systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
              <p className="text-gray-300">
                Our service is provided "as is" without warranties. We are not liable for any 
                damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
              <p className="text-gray-300">
                We reserve the right to modify these terms at any time. Continued use of the 
                service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
              <p className="text-gray-300">
                For questions about these Terms of Service, contact us at: 
                <span className="text-blue-400"> zdhpeter1991@gmail.com</span>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService; 