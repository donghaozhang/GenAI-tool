import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UnifiedGenerationInterface } from '@/components/marketplace/UnifiedGenerationInterface'

// Mock the Sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock the image generation service
vi.mock('@/services/imageGeneration', () => ({
  generateImages: vi.fn(() => Promise.resolve(['mock-generated-image.jpg'])),
}))

describe('UnifiedGenerationInterface - File Upload Tests', () => {
  const mockOnImagesGenerated = vi.fn()
  const mockOnFileUploaded = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderComponent = () => {
    return render(
      <UnifiedGenerationInterface
        onImagesGenerated={mockOnImagesGenerated}
        onFileUploaded={mockOnFileUploaded}
      />
    )
  }

  describe('Component Rendering', () => {
    it('renders the main components', () => {
      renderComponent()
      expect(screen.getByText('AI Generation Studio')).toBeInTheDocument()
      expect(screen.getByText('AI Model')).toBeInTheDocument()
      expect(screen.getByText('Input Method')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
    })

    it('has a file input element', () => {
      renderComponent()
      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('accept', 'image/*')
    })
  })

  describe('File Upload Functionality', () => {
    it('processes file upload correctly and calls onImagesGenerated', () => {
      renderComponent()
      
      const file = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      // Mock the file input
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      fireEvent.change(fileInput)

      // Verify that the callback was called with correct parameters
      expect(mockOnImagesGenerated).toHaveBeenCalledWith(
        ['mock-url-test-image.jpg'],
        'Uploaded: test-image.jpg'
      )
    })

    it('creates object URL for uploaded files', () => {
      renderComponent()
      
      const file = new File(['test content'], 'my-image.png', { type: 'image/png' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      fireEvent.change(fileInput)

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file)
    })

    it('handles JPEG files', () => {
      renderComponent()
      
      const jpegFile = new File(['jpeg data'], 'photo.jpeg', { type: 'image/jpeg' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(fileInput, 'files', { 
        value: [jpegFile], 
        writable: false,
        configurable: true 
      })

      fireEvent.change(fileInput)
      expect(mockOnImagesGenerated).toHaveBeenCalledWith(['mock-url-photo.jpeg'], 'Uploaded: photo.jpeg')
    })

    it('handles PNG files', () => {
      renderComponent()
      
      const pngFile = new File(['png data'], 'graphic.png', { type: 'image/png' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(fileInput, 'files', { 
        value: [pngFile], 
        writable: false,
        configurable: true 
      })

      fireEvent.change(fileInput)
      expect(mockOnImagesGenerated).toHaveBeenCalledWith(['mock-url-graphic.png'], 'Uploaded: graphic.png')
    })

    it('handles files with special characters in names', () => {
      renderComponent()
      
      const file = new File(['content'], 'my awesome image (1).jpg', { type: 'image/jpeg' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      fireEvent.change(fileInput)

      expect(mockOnImagesGenerated).toHaveBeenCalledWith(
        ['mock-url-my awesome image (1).jpg'],
        'Uploaded: my awesome image (1).jpg'
      )
    })

    it('does not process upload when no file is selected', () => {
      renderComponent()
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(fileInput, 'files', {
        value: [],
        writable: false,
      })

      fireEvent.change(fileInput)

      expect(mockOnImagesGenerated).not.toHaveBeenCalled()
      expect(global.URL.createObjectURL).not.toHaveBeenCalled()
    })
  })

  describe('Component State and Behavior', () => {
    it('shows FLUX Schnell as default model', () => {
      renderComponent()
      expect(screen.getByText('FLUX Schnell')).toBeInTheDocument()
    })

    it('shows correct button text for default state', () => {
      renderComponent()
      
      const generateButton = screen.getByRole('button', { name: /generate/i })
      expect(generateButton).toHaveTextContent('Generate')
    })

    it('is disabled by default when no input is provided', () => {
      renderComponent()
      
      const generateButton = screen.getByRole('button', { name: /generate/i })
      expect(generateButton).toBeDisabled()
    })

    it('shows correct placeholder text', () => {
      renderComponent()
      expect(screen.getByPlaceholderText(/describe the image you want to generate/i)).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('calls onImagesGenerated with correct parameters for uploaded file', () => {
      renderComponent()
      
      const file = new File(['test'], 'upload-test.jpg', { type: 'image/jpeg' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      fireEvent.change(fileInput)

      expect(mockOnImagesGenerated).toHaveBeenCalledTimes(1)
      expect(mockOnImagesGenerated).toHaveBeenCalledWith(
        ['mock-url-upload-test.jpg'],
        'Uploaded: upload-test.jpg'
      )
    })

    it('provides consistent interface for parent component', () => {
      const { rerender } = renderComponent()

      // Component should render without errors multiple times
      expect(() => {
        rerender(
          <UnifiedGenerationInterface
            onImagesGenerated={mockOnImagesGenerated}
            onFileUploaded={mockOnFileUploaded}
          />
        )
      }).not.toThrow()

      expect(screen.getByText('AI Generation Studio')).toBeInTheDocument()
    })

    it('handles file upload workflow correctly', () => {
      renderComponent()

      // 1. Verify initial state
      expect(mockOnImagesGenerated).not.toHaveBeenCalled()

      // 2. Upload a file
      const file = new File(['test content'], 'workflow-test.png', { type: 'image/png' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      fireEvent.change(fileInput)

      // 3. Verify workflow completed
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file)
      expect(mockOnImagesGenerated).toHaveBeenCalledWith(
        ['mock-url-workflow-test.png'],
        'Uploaded: workflow-test.png'
      )
    })

    it('correctly formats upload message', () => {
      renderComponent()
      
      const testCases = [
        { filename: 'simple.jpg', expected: 'Uploaded: simple.jpg' },
        { filename: 'test image.png', expected: 'Uploaded: test image.png' },
        { filename: 'file_name-123.jpeg', expected: 'Uploaded: file_name-123.jpeg' },
      ]

      testCases.forEach((testCase, index) => {
        mockOnImagesGenerated.mockClear()
        
        const file = new File(['content'], testCase.filename, { type: 'image/jpeg' })
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

        Object.defineProperty(fileInput, 'files', {
          value: [file],
          writable: false,
          configurable: true,
        })

        fireEvent.change(fileInput)

        expect(mockOnImagesGenerated).toHaveBeenCalledWith(
          [`mock-url-${testCase.filename}`],
          testCase.expected
        )
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles very long filenames', () => {
      renderComponent()
      
      const longFilename = 'a'.repeat(100) + '.jpg'
      const file = new File(['content'], longFilename, { type: 'image/jpeg' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      fireEvent.change(fileInput)

      expect(mockOnImagesGenerated).toHaveBeenCalledWith(
        [`mock-url-${longFilename}`],
        `Uploaded: ${longFilename}`
      )
    })

    it('handles empty file name gracefully', () => {
      renderComponent()
      
      const file = new File(['content'], '', { type: 'image/jpeg' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })

      fireEvent.change(fileInput)

      expect(mockOnImagesGenerated).toHaveBeenCalledWith(
        ['mock-url-'],
        'Uploaded: '
      )
    })
  })
}) 