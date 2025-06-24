import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, LogIn, Plus, Palette } from 'lucide-react';
import { UserProfile } from '@/components/UserProfile';
import { SearchBar } from '../components/marketplace/SearchBar';
import { CategoryFilter } from '../components/marketplace/CategoryFilter';
import { ModelGrid } from '../components/marketplace/ModelGrid';
import { TrendingSection } from '../components/marketplace/TrendingSection';
import { MultiImageDisplay } from '../components/marketplace/MultiImageDisplay';
import { UnifiedGenerationInterface } from '../components/marketplace/UnifiedGenerationInterface';
import CreditsDisplay from '../components/marketplace/CreditsDisplay';
import { BatchGenerationResult } from '../services/imageGeneration';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AIModelMarketplace = () => {
  const navigate = useNavigate();
  
  // Add error handling for auth context (for skip auth users)
  let user, loading;
  try {
    const authContext = useAuth();
    user = authContext.user;
    loading = authContext.loading;
  } catch (error) {
    console.error('Auth context error:', error);
    user = null;
    loading = false;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [batchResults, setBatchResults] = useState<BatchGenerationResult[]>([]);

  // Debug function to add credits manually
  const addTestCredits = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_credits')
        .upsert({
          user_id: user.id,
          credits: 100
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error adding credits:', error);
        toast.error('Failed to add credits');
      } else {
        toast.success('Added 100 test credits!');
        // Refresh the page to update the credit display
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Failed to add credits');
    }
  };

  const handleImagesGenerated = (imageUrls: string[], prompt: string) => {
    setGeneratedImages(prev => [...prev, ...imageUrls]);
    setGenerationPrompt(prompt);
    toast.success(`${imageUrls.length === 1 ? 'Image' : imageUrls.length + ' images'} ${prompt.includes('Uploaded:') ? 'uploaded' : 'generated'} successfully!`);
  };

  const handleFileUploaded = (file: File) => {
    // This callback is no longer needed since we handle uploads via onImagesGenerated
    console.log('File uploaded callback - not used');
  };

  const handleBatchResults = (results: BatchGenerationResult[]) => {
    setBatchResults(results);
    console.log('Batch results received:', results);
  };

  const allImages = generatedImages;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">marketartAI</h1>
              <p className="text-gray-400 mt-1">Discover and use cutting-edge AI models with pipeline capabilities</p>
            </div>
            
            {/* Auth Status */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/designer')}
                size="sm"
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                <Palette className="mr-2 h-4 w-4" />
                AI Designer
              </Button>
              
              {user ? (
                <>
                  <CreditsDisplay />
                  {/* Debug button - remove in production */}
                  <Button
                    onClick={addTestCredits}
                    size="sm"
                    variant="outline"
                    className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Test Credits
                  </Button>
                  <UserProfile />
                </>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guest User Banner */}
      {!user && (
        <div className="bg-blue-900/20 border-b border-blue-700/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-blue-400">
                  <span className="text-sm">✨ You're in guest mode!</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Sign up to save your generated images and access more features.
                </p>
              </div>
              <Button
                onClick={() => navigate('/auth')}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Unified Generation Interface */}
              <UnifiedGenerationInterface
        onImagesGenerated={handleImagesGenerated}
        onFileUploaded={handleFileUploaded}
        onBatchResults={handleBatchResults}
      />

        {/* Image Display with Built-in Pipeline */}
        {allImages.length > 0 && (
          <div className="mb-8">
            <MultiImageDisplay 
              images={allImages}
              prompt={generationPrompt}
            />
          </div>
        )}

        {/* Trending Section */}
        <div className="mb-8">
          <TrendingSection />
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </div>
          
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Featured Models */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Featured AI Models</h2>
          <ModelGrid 
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>
    </div>
  );
};

export default AIModelMarketplace;
