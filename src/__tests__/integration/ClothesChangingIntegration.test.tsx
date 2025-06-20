import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UnifiedGenerationInterface } from '@/components/marketplace/UnifiedGenerationInterface'

// Mock the pipeline processing
vi.mock('@/utils/pipelineProcessing', () => ({
  processImagePipeline: vi.fn()
}))

// Mock image generation
vi.mock('@/services/imageGeneration', () => ({
  generateImageWithModel: vi.fn()
}))

// Mock file reading
const createMockFile = (name: string, type: string, content: string) => {
  const file = new File([content], name, { type })
  return file
}

describe('Clothes Changing Integration Tests', () => {
  const mockProps = {
    onImagesGenerated: vi.fn(),
    onFileUploaded: vi.fn(),
    onPipelineProcessed: vi.fn(),
    selectedModel: 'fal-ai/flux-pro/kontext',
    onModelSelect: vi.fn()
  }

  let mockProcessImagePipeline: any
  let mockGenerateImageWithModel: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get the mocked functions
    const { processImagePipeline } = await import('@/utils/pipelineProcessing')
    const { generateImageWithModel } = await import('@/services/imageGeneration')
    mockProcessImagePipeline = processImagePipeline as any
    mockGenerateImageWithModel = generateImageWithModel as any
    
    // Mock FileReader
    global.FileReader = vi.fn(() => ({
      readAsDataURL: vi.fn(function(this: any) {
        // Simulate successful file reading
        setTimeout(() => {
          this.result = 'data:image/jpeg;base64,mockImageData'
          this.onload?.()
        }, 10)
      }),
      result: null,
      onload: null,
      onerror: null
    })) as any
  })

  describe('Complete Clothes Changing Workflow', () => {
    it('should successfully change clothes in uploaded image', async () => {
      const user = userEvent.setup()
      
      // Mock successful pipeline processing
      mockProcessImagePipeline.mockResolvedValue('https://fal.media/transformed-clothes.jpg')

      render(<UnifiedGenerationInterface {...mockProps} />)

      // 1. Select the FLUX Pro Kontext model for clothes changing
      const modelSelects = screen.getAllByRole('combobox')
      const modelSelect = modelSelects[0] // First combobox is the AI Model selector
      await user.click(modelSelect)
      
      const fluxOption = screen.getByText(/fal-ai\/flux-pro\/kontext/i)
      await user.click(fluxOption)

      // 2. Upload an image
      const fileInput = screen.getByRole('button', { name: /upload image/i })
      const mockFile = createMockFile('portrait.jpg', 'image/jpeg', 'mock image data')
      
      // Simulate file upload
      const hiddenInput = screen.getByTestId('file-input')
      await user.upload(hiddenInput, mockFile)

      // Wait for file to be processed
      await waitFor(() => {
        expect(mockProps.onImagesGenerated).toHaveBeenCalledWith(
          ['data:image/jpeg;base64,mockImageData'],
          'uploaded',
          'fal-ai/flux-pro/kontext'
        )
      }, { timeout: 1000 })

      // 3. Enter clothes changing prompt
      const promptInput = screen.getByPlaceholderText(/describe the image transformation/i)
      await user.type(promptInput, 'change the person\'s outfit to an elegant red evening dress')

      // 4. Trigger pipeline processing
      const processButton = screen.getByRole('button', { name: /transform image/i })
      await user.click(processButton)

      // 5. Verify pipeline was called correctly
      await waitFor(() => {
        expect(mockProcessImagePipeline).toHaveBeenCalledWith(
          'fal-ai/flux-pro/kontext',
          'data:image/jpeg;base64,mockImageData',
          'change the person\'s outfit to an elegant red evening dress'
        )
      })

      // 6. Verify result callback
      await waitFor(() => {
        expect(mockProps.onPipelineProcessed).toHaveBeenCalledWith(
          'https://fal.media/transformed-clothes.jpg'
        )
      })
    })

    it('should handle multiple clothing transformations', async () => {
      const user = userEvent.setup()
      
      const transformations = [
        { prompt: 'change to business suit', result: 'business-suit.jpg' },
        { prompt: 'change to casual wear', result: 'casual-wear.jpg' },
        { prompt: 'change to winter outfit', result: 'winter-outfit.jpg' }
      ]

      render(<UnifiedGenerationInterface {...mockProps} />)

      // Select model
      const modelSelects = screen.getAllByRole('combobox')
      const modelSelect = modelSelects[0] // First combobox is the AI Model selector
      await user.click(modelSelect)
      await user.click(screen.getByText(/fal-ai\/flux-pro\/kontext/i))

      // Upload image once
      const hiddenInput = screen.getByTestId('file-input')
      const mockFile = createMockFile('person.jpg', 'image/jpeg', 'person image')
      await user.upload(hiddenInput, mockFile)

      await waitFor(() => {
        expect(mockProps.onImagesGenerated).toHaveBeenCalled()
      })

      // Test each transformation
      for (const [index, transformation] of transformations.entries()) {
        mockProcessImagePipeline.mockResolvedValue(`https://fal.media/${transformation.result}`)

        const promptInput = screen.getByPlaceholderText(/describe the image transformation/i)
        await user.clear(promptInput)
        await user.type(promptInput, transformation.prompt)

        const processButton = screen.getByRole('button', { name: /transform image/i })
        await user.click(processButton)

        await waitFor(() => {
          expect(mockProcessImagePipeline).toHaveBeenCalledWith(
            'fal-ai/flux-pro/kontext',
            'data:image/jpeg;base64,mockImageData',
            transformation.prompt
          )
        })

        await waitFor(() => {
          expect(mockProps.onPipelineProcessed).toHaveBeenCalledWith(
            `https://fal.media/${transformation.result}`
          )
        })
      }
    })
  })

  describe('Error Handling in Clothes Changing', () => {
    it('should handle pipeline processing errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock pipeline error
      mockProcessImagePipeline.mockRejectedValue(new Error('FAL API error: Invalid image format'))

      render(<UnifiedGenerationInterface {...mockProps} />)

      // Setup and upload
      const modelSelects = screen.getAllByRole('combobox')
      const modelSelect = modelSelects[0] // First combobox is the AI Model selector
      await user.click(modelSelect)
      await user.click(screen.getByText(/fal-ai\/flux-pro\/kontext/i))

      const hiddenInput = screen.getByTestId('file-input')
      const mockFile = createMockFile('invalid.jpg', 'image/jpeg', 'invalid data')
      await user.upload(hiddenInput, mockFile)

      await waitFor(() => {
        expect(mockProps.onImagesGenerated).toHaveBeenCalled()
      })

      // Try to process
      const promptInput = screen.getByPlaceholderText(/describe the image transformation/i)
      await user.type(promptInput, 'change outfit')

      const processButton = screen.getByRole('button', { name: /transform image/i })
      await user.click(processButton)

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/processing failed/i)).toBeInTheDocument()
      })
    })

    it('should validate image upload before processing', async () => {
      const user = userEvent.setup()

      render(<UnifiedGenerationInterface {...mockProps} />)

      // Select model
      const modelSelects = screen.getAllByRole('combobox')
      const modelSelect = modelSelects[0] // First combobox is the AI Model selector
      await user.click(modelSelect)
      await user.click(screen.getByText(/fal-ai\/flux-pro\/kontext/i))

      // Try to process without uploading image
      const promptInput = screen.getByPlaceholderText(/describe the image transformation/i)
      await user.type(promptInput, 'change clothes')

      const processButton = screen.getByRole('button', { name: /transform image/i })
      
      // Button should be disabled without image
      expect(processButton).toBeDisabled()
    })
  })

  describe('Model-Specific Behavior', () => {
    it('should show correct UI for image-to-image models', async () => {
      const user = userEvent.setup()

      render(<UnifiedGenerationInterface {...mockProps} />)

      // Select FLUX Pro Kontext (image-to-image)
      const modelSelects = screen.getAllByRole('combobox')
      const modelSelect = modelSelects[0] // First combobox is the AI Model selector
      await user.click(modelSelect)
      await user.click(screen.getByText(/fal-ai\/flux-pro\/kontext/i))

      // Should show image upload section
      expect(screen.getByText(/upload image/i)).toBeInTheDocument()
      
      // Should show transformation prompt
      expect(screen.getByPlaceholderText(/describe the image transformation/i)).toBeInTheDocument()
      
      // Should show transform button (not generate)
      expect(screen.getByRole('button', { name: /transform image/i })).toBeInTheDocument()
    })

    it('should adapt UI when switching between model types', async () => {
      const user = userEvent.setup()

      render(<UnifiedGenerationInterface {...mockProps} />)

      // Start with text-to-image model
      const modelSelects = screen.getAllByRole('combobox')
      const modelSelect = modelSelects[0] // First combobox is the AI Model selector
      await user.click(modelSelect)
      await user.click(screen.getByText(/fal-ai\/imagen4\/preview/i))

      // Should show text prompt interface
      expect(screen.getByPlaceholderText(/describe the image you want to generate/i)).toBeInTheDocument()

      // Switch to image-to-image model
      await user.click(modelSelect)
      await user.click(screen.getByText(/fal-ai\/flux-pro\/kontext/i))

      // Should show image upload interface
      expect(screen.getByText(/upload image/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/describe the image transformation/i)).toBeInTheDocument()
    })
  })

  describe('Real-world Clothes Changing Scenarios', () => {
    it('should handle professional outfit transformation', async () => {
      const user = userEvent.setup()
      
      mockProcessImagePipeline.mockResolvedValue('https://fal.media/professional-outfit.jpg')

      render(<UnifiedGenerationInterface {...mockProps} />)

      // Setup
      const modelSelects = screen.getAllByRole('combobox')
      const modelSelect = modelSelects[0] // First combobox is the AI Model selector
      await user.click(modelSelect)
      await user.click(screen.getByText(/fal-ai\/flux-pro\/kontext/i))

      // Upload portrait
      const hiddenInput = screen.getByTestId('file-input')
      const portraitFile = createMockFile('casual-portrait.jpg', 'image/jpeg', 'casual person')
      await user.upload(hiddenInput, portraitFile)

      await waitFor(() => {
        expect(mockProps.onImagesGenerated).toHaveBeenCalled()
      })

      // Professional transformation
      const promptInput = screen.getByPlaceholderText(/describe the image transformation/i)
      await user.type(promptInput, 'transform the person into professional business attire with a dark suit, white shirt, and tie')

      const processButton = screen.getByRole('button', { name: /transform image/i })
      await user.click(processButton)

      await waitFor(() => {
        expect(mockProcessImagePipeline).toHaveBeenCalledWith(
          'fal-ai/flux-pro/kontext',
          'data:image/jpeg;base64,mockImageData',
          'transform the person into professional business attire with a dark suit, white shirt, and tie'
        )
      })
    })

    it('should handle seasonal outfit changes', async () => {
      const user = userEvent.setup()
      
      const seasonalOutfits = [
        'change to summer beach outfit with light colors',
        'transform into winter clothing with coat and scarf',
        'change to spring outfit with light jacket',
        'transform into autumn attire with warm layers'
      ]

      render(<UnifiedGenerationInterface {...mockProps} />)

      // Setup once
      const modelSelects = screen.getAllByRole('combobox')
      const modelSelect = modelSelects[0] // First combobox is the AI Model selector
      await user.click(modelSelect)
      await user.click(screen.getByText(/fal-ai\/flux-pro\/kontext/i))

      const hiddenInput = screen.getByTestId('file-input')
      const personFile = createMockFile('person.jpg', 'image/jpeg', 'person image')
      await user.upload(hiddenInput, personFile)

      await waitFor(() => {
        expect(mockProps.onImagesGenerated).toHaveBeenCalled()
      })

      // Test each seasonal outfit
      for (const outfit of seasonalOutfits) {
        mockProcessImagePipeline.mockResolvedValue(`https://fal.media/${outfit.split(' ')[2]}-outfit.jpg`)

        const promptInput = screen.getByPlaceholderText(/describe the image transformation/i)
        await user.clear(promptInput)
        await user.type(promptInput, outfit)

        const processButton = screen.getByRole('button', { name: /transform image/i })
        await user.click(processButton)

        await waitFor(() => {
          expect(mockProcessImagePipeline).toHaveBeenCalledWith(
            'fal-ai/flux-pro/kontext',
            'data:image/jpeg;base64,mockImageData',
            outfit
          )
        })
      }
    })
  })
}) 