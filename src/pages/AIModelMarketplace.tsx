
import React, { useState } from 'react';
import { SearchBar } from '../components/marketplace/SearchBar';
import { CategoryFilter } from '../components/marketplace/CategoryFilter';
import { ModelGrid } from '../components/marketplace/ModelGrid';
import { TrendingSection } from '../components/marketplace/TrendingSection';
import { PromptInput } from '../components/marketplace/PromptInput';
import { MultiImageDisplay } from '../components/marketplace/MultiImageDisplay';
import { ModelSelector } from '../components/marketplace/ModelSelector';
import { ImageUploadButton } from '../components/marketplace/ImageUploadButton';
import { ImagePipeline } from '../components/marketplace/ImagePipeline';
import { toast } from 'sonner';

const AIModelMarketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('Most relevant');
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('flux-schnell');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [showPipeline, setShowPipeline] = useState(false);

  const handleImagesGenerated = (imageUrls: string[], prompt: string) => {
    setGeneratedImageUrls(imageUrls);
    setCurrentPrompt(prompt);
    setUploadedFile(null); // Clear uploaded file when generating new images
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  const handleFileUpload = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileUrl = e.target?.result as string;
        setUploadedFile(fileUrl);
        setGeneratedImageUrls([]); // Clear generated images when uploading file
        setShowPipeline(true); // Automatically show pipeline when file is uploaded
        toast.success('File uploaded successfully!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Model Marketplace</h1>
          <p className="text-gray-400">Discover and use cutting-edge AI models with pipeline capabilities</p>
        </div>

        {/* Model Selector */}
        <ModelSelector 
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
        />

        {/* Action Buttons Section */}
        <div className="mb-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Get Started</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <ImageUploadButton onFileSelect={handleFileUpload} />
            <div className="flex items-center gap-2 text-gray-400">
              <span>or</span>
            </div>
            <div className="text-blue-400 text-sm">Use text prompt below to generate images</div>
          </div>
        </div>

        {/* Prompt Input Section */}
        <div className="mb-8">
          <PromptInput 
            onImagesGenerated={handleImagesGenerated}
            selectedModel={selectedModel}
          />
        </div>

        {/* Generated Images Display with Pipeline */}
        {generatedImageUrls.length > 0 && (
          <div className="mb-8">
            <MultiImageDisplay 
              imageUrls={generatedImageUrls} 
              prompt={currentPrompt}
            />
          </div>
        )}

        {/* Uploaded File Pipeline */}
        {uploadedFile && showPipeline && (
          <div className="mb-8">
            <ImagePipeline sourceImageUrl={uploadedFile} />
          </div>
        )}

        {/* Trending Section */}
        <TrendingSection />

        {/* Main Content */}
        <div className="flex gap-8 mt-12">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery} 
            />
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Featured Models Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Featured Models</h2>
                <p className="text-gray-400">Check out some of our most popular models</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Sort by</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
                >
                  <option>Most relevant</option>
                  <option>Newest</option>
                  <option>Most popular</option>
                  <option>Highest rated</option>
                </select>
              </div>
            </div>

            {/* Model Grid */}
            <ModelGrid 
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              sortBy={sortBy}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModelMarketplace;
