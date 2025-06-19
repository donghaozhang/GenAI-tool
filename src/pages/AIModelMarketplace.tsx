import React, { useState } from 'react';
import { SearchBar } from '../components/marketplace/SearchBar';
import { CategoryFilter } from '../components/marketplace/CategoryFilter';
import { ModelGrid } from '../components/marketplace/ModelGrid';
import { TrendingSection } from '../components/marketplace/TrendingSection';
import { MultiImageDisplay } from '../components/marketplace/MultiImageDisplay';
import { UnifiedGenerationInterface } from '../components/marketplace/UnifiedGenerationInterface';
import { ImagePipeline } from '../components/marketplace/ImagePipeline';
import { toast } from 'sonner';

const AIModelMarketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [showPipeline, setShowPipeline] = useState(false);

  const handleImagesGenerated = (imageUrls: string[], prompt: string) => {
    setGeneratedImages(imageUrls);
    setGenerationPrompt(prompt);
    toast.success(`Generated ${imageUrls.length} image(s) successfully!`);
  };

  const handleFileUploaded = (file: File) => {
    setUploadedFiles(prev => [...prev, file]);
    toast.success('File uploaded successfully!');
  };

  const allImages = [
    ...generatedImages,
    ...uploadedFiles.map(file => URL.createObjectURL(file))
  ];

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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Unified Generation Interface */}
        <UnifiedGenerationInterface 
          onImagesGenerated={handleImagesGenerated}
          onFileUploaded={handleFileUploaded}
        />

        {/* Image Display */}
        {allImages.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Generated Images ({allImages.length})</h3>
              <button
                onClick={() => setShowPipeline(!showPipeline)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <span>🔧</span>
                {showPipeline ? 'Hide Pipeline' : 'Show Pipeline'}
              </button>
            </div>
            <MultiImageDisplay 
              images={allImages}
              prompt={generationPrompt}
            />
          </div>
        )}

        {/* Pipeline Processing */}
        {showPipeline && allImages.length > 0 && (
          <div className="mb-8">
            <ImagePipeline />
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
