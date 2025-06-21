import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UnifiedGenerationInterface } from '@/components/marketplace/UnifiedGenerationInterface';
import { toast } from 'sonner';

// Mock the services
vi.mock('@/services/imageGeneration', () => ({
  generateImageWithModel: vi.fn()
}));

vi.mock('@/utils/pipelineProcessing', () => ({
  processImagePipeline: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

const mockOnImagesGenerated = vi.fn();
const mockOnFileUploaded = vi.fn();

describe('UnifiedGenerationInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default text-to-image model', () => {
    render(
      <UnifiedGenerationInterface
        onImagesGenerated={mockOnImagesGenerated}
        onFileUploaded={mockOnFileUploaded}
      />
    );

    expect(screen.getByText('AI Generation Studio')).toBeInTheDocument();
    expect(screen.getByText('fal-ai/imagen4/preview')).toBeInTheDocument();
    expect(screen.getAllByText('Text to Image')).toHaveLength(2); // One in header, one in model card
  });

  it('should show correct model IDs including fixed FLUX Pro Kontext', () => {
    render(
      <UnifiedGenerationInterface
        onImagesGenerated={mockOnImagesGenerated}
        onFileUploaded={mockOnFileUploaded}
      />
    );

    // Find the AI Model section and its combobox
    const modelSection = screen.getByText('AI Model').closest('div');
    const modelSelector = modelSection?.querySelector('[role="combobox"]') as HTMLElement;
    fireEvent.click(modelSelector);

    // Check that FLUX Pro Kontext is available (this verifies the model ID fix)
    expect(screen.getByText('fal-ai/flux-pro/kontext')).toBeInTheDocument();
  });

  it('should switch input method when selecting image-to-image model', async () => {
    render(
      <UnifiedGenerationInterface
        onImagesGenerated={mockOnImagesGenerated}
        onFileUploaded={mockOnFileUploaded}
      />
    );

    // Find the AI Model section and its combobox
    const modelSection = screen.getByText('AI Model').closest('div');
    const modelSelector = modelSection?.querySelector('[role="combobox"]') as HTMLElement;
    fireEvent.click(modelSelector);
    
    const fluxKontextOption = screen.getByText('fal-ai/flux-pro/kontext');
    fireEvent.click(fluxKontextOption);

    // Should switch to upload mode and show Image to Image type
    await waitFor(() => {
      expect(screen.getAllByText('Image to Image')).toHaveLength(2); // One in header, one in model card
    });
  });

  it('should call generateImageWithModel for text-to-image models', async () => {
    const { generateImageWithModel } = await import('@/services/imageGeneration');
    const mockGenerateImageWithModel = generateImageWithModel as any;
    mockGenerateImageWithModel.mockResolvedValue(['http://example.com/image1.jpg']);

    render(
      <UnifiedGenerationInterface
        onImagesGenerated={mockOnImagesGenerated}
        onFileUploaded={mockOnFileUploaded}
      />
    );

    // Enter a prompt
    const textArea = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(textArea, { target: { value: 'A beautiful landscape' } });

    // Click generate
    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockGenerateImageWithModel).toHaveBeenCalledWith(
        'fal-ai/imagen4/preview',
        'A beautiful landscape',
        1
      );
    });

    expect(mockOnImagesGenerated).toHaveBeenCalledWith(
      ['http://example.com/image1.jpg'],
      'A beautiful landscape'
    );
  });

  it('should call processImagePipeline for image-to-image models', async () => {
    const { processImagePipeline } = await import('@/utils/pipelineProcessing');
    const mockProcessImagePipeline = processImagePipeline as any;
    mockProcessImagePipeline.mockResolvedValue('http://example.com/output.jpg');

    render(
      <UnifiedGenerationInterface
        onImagesGenerated={mockOnImagesGenerated}
        onFileUploaded={mockOnFileUploaded}
      />
    );

    // Find the AI Model section and its combobox
    const modelSection = screen.getByText('AI Model').closest('div');
    const modelSelector = modelSection?.querySelector('[role="combobox"]') as HTMLElement;
    fireEvent.click(modelSelector);
    const fluxKontextOption = screen.getByText('fal-ai/flux-pro/kontext');
    fireEvent.click(fluxKontextOption);

    // Mock file upload
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      result: 'data:image/jpeg;base64,test123',
      onload: null as any
    };
    
    global.FileReader = vi.fn(() => mockFileReader) as any;

    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Simulate FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,test123' } } as any);
    }

    // Enter a transformation prompt
    await waitFor(() => {
      const promptArea = screen.getByPlaceholderText('Describe how you want to transform the uploaded image...');
      fireEvent.change(promptArea, { target: { value: 'change the shirt to red' } });
    });

    // Click transform
    const transformButton = screen.getByRole('button', { name: /transform/i });
    fireEvent.click(transformButton);

    await waitFor(() => {
      expect(mockProcessImagePipeline).toHaveBeenCalledWith(
        'fal-ai/flux-pro/kontext',
        'data:image/jpeg;base64,test123',
        'change the shirt to red'
      );
    });

    expect(mockOnImagesGenerated).toHaveBeenCalledWith(
      ['http://example.com/output.jpg'],
      'change the shirt to red'
    );
  });

  it('should show error when text-to-image generation fails', async () => {
    const { generateImageWithModel } = await import('@/services/imageGeneration');
    const mockGenerateImageWithModel = generateImageWithModel as any;
    mockGenerateImageWithModel.mockRejectedValue(new Error('API Error'));

    render(
      <UnifiedGenerationInterface
        onImagesGenerated={mockOnImagesGenerated}
        onFileUploaded={mockOnFileUploaded}
      />
    );

    // Enter a prompt
    const textArea = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(textArea, { target: { value: 'A beautiful landscape' } });

    // Click generate
    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to generate: API Error');
    });
  });

  it('should show error when pipeline processing fails', async () => {
    const { processImagePipeline } = await import('@/utils/pipelineProcessing');
    const mockProcessImagePipeline = processImagePipeline as any;
    mockProcessImagePipeline.mockRejectedValue(new Error('Pipeline Error'));

    render(
      <UnifiedGenerationInterface
        onImagesGenerated={mockOnImagesGenerated}
        onFileUploaded={mockOnFileUploaded}
      />
    );

    // Find the AI Model section and its combobox
    const modelSection = screen.getByText('AI Model').closest('div');
    const modelSelector = modelSection?.querySelector('[role="combobox"]') as HTMLElement;
    fireEvent.click(modelSelector);
    const fluxKontextOption = screen.getByText('fal-ai/flux-pro/kontext');
    fireEvent.click(fluxKontextOption);

    // Mock file upload
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      result: 'data:image/jpeg;base64,test123',
      onload: null as any
    };
    
    global.FileReader = vi.fn(() => mockFileReader) as any;

    fireEvent.change(fileInput, { target: { files: [file] } });
    
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,test123' } } as any);
    }

    await waitFor(() => {
      const promptArea = screen.getByPlaceholderText('Describe how you want to transform the uploaded image...');
      fireEvent.change(promptArea, { target: { value: 'change the shirt to red' } });
    });

    const transformButton = screen.getByRole('button', { name: /transform/i });
    fireEvent.click(transformButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to generate: Pipeline Error');
    });
  });

  it('should handle multiple image generation', async () => {
    const { generateImageWithModel } = await import('@/services/imageGeneration');
    const mockGenerateImageWithModel = generateImageWithModel as any;
    mockGenerateImageWithModel.mockResolvedValue([
      'http://example.com/image1.jpg',
      'http://example.com/image2.jpg',
      'http://example.com/image3.jpg'
    ]);

    render(
      <UnifiedGenerationInterface
        onImagesGenerated={mockOnImagesGenerated}
        onFileUploaded={mockOnFileUploaded}
      />
    );

    // Find the Number of Images/Videos section and its combobox
    const imageCountSection = screen.getByText('Number of Images').closest('div');
    const imageCountSelector = imageCountSection?.querySelector('[role="combobox"]') as HTMLElement;
    fireEvent.click(imageCountSelector);
    const threeImagesOption = screen.getByText('3 images');
    fireEvent.click(threeImagesOption);

    // Enter a prompt
    const textArea = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(textArea, { target: { value: 'Multiple landscapes' } });

    // Click generate
    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockGenerateImageWithModel).toHaveBeenCalledWith(
        'fal-ai/imagen4/preview',
        'Multiple landscapes',
        3
      );
    });

    expect(mockOnImagesGenerated).toHaveBeenCalledWith(
      ['http://example.com/image1.jpg', 'http://example.com/image2.jpg', 'http://example.com/image3.jpg'],
      'Multiple landscapes'
    );

    expect(toast.success).toHaveBeenCalledWith('Generated 3 image(s) successfully!');
  });
}); 