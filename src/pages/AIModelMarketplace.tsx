import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, LogIn } from 'lucide-react';
import { SearchBar } from '../components/marketplace/SearchBar';
import { CategoryFilter } from '../components/marketplace/CategoryFilter';
import { ModelGrid } from '../components/marketplace/ModelGrid';
import { TrendingSection } from '../components/marketplace/TrendingSection';
import { MultiImageDisplay } from '../components/marketplace/MultiImageDisplay';
import { UnifiedGenerationInterface } from '../components/marketplace/UnifiedGenerationInterface';
import { BatchGenerationResult } from '../services/imageGeneration';
import { toast } from 'sonner';

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
              <h1 className="text-3xl font-bold text-white">AI Model Marketplace</h1>
              <p className="text-gray-400 mt-1">Discover and use cutting-edge AI models with pipeline capabilities</p>
            </div>
            
            {/* Auth Status */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <User size={20} />
                  <span className="text-sm">Signed in</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <span className="text-sm">Guest mode</span>
                  </div>
                  <Button
                    onClick={() => navigate('/auth')}
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                  >
                    <LogIn size={16} className="mr-2" />
                    Sign In
                  </Button>
                </div>
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
