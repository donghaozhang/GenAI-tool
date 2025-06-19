
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { downloadAllPokemonImages } from '../services/pokemonImageDownloader';
import { toast } from 'sonner';
import { Download, Loader2, Globe } from 'lucide-react';

interface PokemonImageDownloaderProps {
  onImagesDownloaded?: (images: Record<string, string>) => void;
}

const PokemonImageDownloader: React.FC<PokemonImageDownloaderProps> = ({ onImagesDownloaded }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedImages, setDownloadedImages] = useState<Record<string, string>>({});

  const handleDownloadImages = async () => {
    setIsDownloading(true);
    try {
      toast.info('Downloading Pokemon images from the internet...');
      const images = await downloadAllPokemonImages();
      setDownloadedImages(images);
      onImagesDownloaded?.(images);
      
      const downloadedCount = Object.keys(images).length;
      if (downloadedCount > 0) {
        toast.success(`Successfully downloaded ${downloadedCount} Pokemon images!`);
      } else {
        toast.warning('No images could be downloaded. Please try again later.');
      }
    } catch (error) {
      console.error('Error downloading images:', error);
      toast.error('Failed to download images. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const saveImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold text-blue-400 flex items-center justify-center gap-2">
          <Globe className="w-5 h-5" />
          🌐 Download Pokemon Images from Internet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Button
            onClick={handleDownloadImages}
            disabled={isDownloading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Downloading Images...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Pokemon Sprites
              </>
            )}
          </Button>
        </div>

        {Object.keys(downloadedImages).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {Object.entries(downloadedImages).map(([type, imageUrl]) => (
              <div key={type} className="text-center">
                <img
                  src={imageUrl}
                  alt={`${type} Pokemon`}
                  className="w-full h-32 object-contain rounded-lg border-2 border-gray-300 mb-2 bg-white"
                />
                <p className="capitalize font-semibold text-white mb-2">{type}</p>
                <Button
                  onClick={() => saveImage(imageUrl, type)}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-400 text-center mt-4">
          <p>Images are downloaded from public Pokemon databases and sprite collections.</p>
          <p>These images can be used as fallback sprites when AI generation is unavailable.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PokemonImageDownloader;
