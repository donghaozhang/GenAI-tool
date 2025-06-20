import React from 'react';
import { Button } from '../ui/button';
import { Loader2, Play, Download, Upload, RefreshCw, Volume2, Type, Box } from 'lucide-react';
import { PipelineModel } from '@/constants/models';
import { ModelViewer3D } from './ModelViewer3D';

interface ImageDisplayGridProps {
  currentSourceImage: string | null;
  uploadedImageUrl: string | null;
  pipelineResult: string | null;
  isProcessing: boolean;
  selectedModel: PipelineModel | undefined;
  onUseResultAsInput: () => void;
}

export const ImageDisplayGrid: React.FC<ImageDisplayGridProps> = ({
  currentSourceImage,
  uploadedImageUrl,
  pipelineResult,
  isProcessing,
  selectedModel,
  onUseResultAsInput,
}) => {
  // If we have a pipeline result, show both sections in grid
  if (pipelineResult || isProcessing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Source Image/Video */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Input {selectedModel?.type === 'video-to-audio' ? 'Video' : 'Media'}</label>
          <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden relative">
            {currentSourceImage ? (
              <>
                {selectedModel?.type === 'image-to-video' || selectedModel?.type === 'video-to-audio' ? (
                  <video
                    src={currentSourceImage}
                    controls
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={currentSourceImage}
                    alt="Source for pipeline"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  {uploadedImageUrl ? 'Uploaded' : 'Generated'}
                </div>
              </>
            ) : selectedModel?.type === 'text-to-video' ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Text-to-Video Generation</p>
                  <p className="text-xs text-gray-400">No input media required</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Upload media or generate first</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Result */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Pipeline Output</label>
          <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden relative flex items-center justify-center">
            {isProcessing ? (
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-300 text-sm">Processing...</p>
              </div>
            ) : pipelineResult ? (
              <>
                {selectedModel?.type === 'image-to-video' || selectedModel?.type === 'text-to-video' ? (
                  <video
                    src={pipelineResult}
                    controls
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                  />
                ) : selectedModel?.type === 'video-to-audio' ? (
                  <div className="text-center p-4">
                    <Volume2 className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                    <audio
                      src={pipelineResult}
                      controls
                      className="w-full"
                    />
                    <p className="text-sm text-gray-400 mt-2">Generated sound effects</p>
                  </div>
                ) : selectedModel?.type === 'image-to-3d' ? (
                  <div className="w-full h-full">
                    <ModelViewer3D 
                      modelUrl={pipelineResult}
                      onDownload={() => {
                        const link = document.createElement('a');
                        link.href = pipelineResult;
                        link.download = '3d-model.zip';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    />
                  </div>
                ) : (
                  <img
                    src={pipelineResult}
                    alt="Pipeline result"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Output
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {selectedModel?.type !== 'video-to-audio' && selectedModel?.type !== 'image-to-3d' && (
                    <Button 
                      onClick={onUseResultAsInput}
                      size="sm" 
                      variant="secondary" 
                      className="h-6 text-xs"
                      title="Use as input for next pipeline"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  )}
                  {selectedModel?.type !== 'image-to-3d' && (
                    <Button size="sm" variant="secondary" className="h-6 text-xs">
                      <Download className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">
                <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Pipeline output will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If we only have an input image and no pipeline result, show single full-width section
  if (currentSourceImage) {
    return (
      <div className="mb-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Input {selectedModel?.type === 'video-to-audio' ? 'Video' : 'Media'}</label>
          <div className="w-full bg-gray-700 rounded-lg overflow-hidden relative">
            {selectedModel?.type === 'image-to-video' || selectedModel?.type === 'video-to-audio' ? (
              <video
                src={currentSourceImage}
                controls
                className="w-full h-auto object-contain"
                muted
              />
            ) : (
              <img
                src={currentSourceImage}
                alt="Source for pipeline"
                className="w-full h-auto object-contain"
              />
            )}
            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              {uploadedImageUrl ? 'Uploaded' : 'Generated'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default empty state - don't show anything since the upload section handles this
  return null;
};
