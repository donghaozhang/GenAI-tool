
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { generateAllPokemonImages } from '../services/imageGeneration';
import { toast } from 'sonner';
import { Download, Loader2 } from 'lucide-react';

interface PokemonImageGeneratorProps {
  onImagesGenerated?: (images: Record<string, string>) => void;
}

const PokemonImageGenerator: React.FC<PokemonImageGeneratorProps> = ({ onImagesGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});

  const handleGenerateImages = async () => {
    setIsGenerating(true);
    try {
      toast.info('Generating Pokemon images... This may take a moment!');
      const images = await generateAllPokemonImages();
      setGeneratedImages(images);
      onImagesGenerated?.(images);
      toast.success('Pokemon images generated successfully!');
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold text-yellow-400">
          🎨 Pokemon Image Generator (Fal AI)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Button
            onClick={handleGenerateImages}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Pokemon...
              </>
            ) : (
              'Generate Pokemon Images'
            )}
          </Button>
        </div>

        {Object.keys(generatedImages).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {Object.entries(generatedImages).map(([type, imageUrl]) => (
              <div key={type} className="text-center">
                <img
                  src={imageUrl}
                  alt={`${type} Pokemon`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-300 mb-2"
                />
                <p className="capitalize font-semibold text-white mb-2">{type}</p>
                <Button
                  onClick={() => downloadImage(imageUrl, type)}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PokemonImageGenerator;
