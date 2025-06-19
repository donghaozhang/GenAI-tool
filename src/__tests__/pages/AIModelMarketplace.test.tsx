import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import AIModelMarketplace from '@/pages/AIModelMarketplace'

// Mock all the child components
vi.mock('@/components/marketplace/SearchBar', () => ({
  SearchBar: ({ searchQuery, onSearchChange }: any) => (
    <input 
      data-testid="search-bar" 
      value={searchQuery} 
      onChange={(e) => onSearchChange(e.target.value)} 
      placeholder="Search..."
    />
  )
}))

vi.mock('@/components/marketplace/CategoryFilter', () => ({
  CategoryFilter: ({ selectedCategory, onCategoryChange }: any) => (
    <select 
      data-testid="category-filter" 
      value={selectedCategory} 
      onChange={(e) => onCategoryChange(e.target.value)}
      aria-label="Category filter"
    >
      <option value="all">All</option>
      <option value="text-to-image">Text to Image</option>
    </select>
  )
}))

vi.mock('@/components/marketplace/ModelGrid', () => ({
  ModelGrid: ({ searchQuery, selectedCategory }: any) => (
    <div data-testid="model-grid">
      Models for: {selectedCategory} | Search: {searchQuery}
    </div>
  )
}))

vi.mock('@/components/marketplace/TrendingSection', () => ({
  TrendingSection: () => <div data-testid="trending-section">Trending Section</div>
}))

vi.mock('@/components/marketplace/MultiImageDisplay', () => ({
  MultiImageDisplay: ({ images, prompt }: any) => (
    <div data-testid="multi-image-display">
      <div data-testid="image-count">Images: {images.length}</div>
      <div data-testid="image-prompt">Prompt: {prompt}</div>
      {images.map((img: string, idx: number) => (
        <img key={idx} data-testid={`displayed-image-${idx}`} src={img} alt={`Image ${idx}`} />
      ))}
    </div>
  )
}))

vi.mock('@/components/marketplace/UnifiedGenerationInterface', () => ({
  UnifiedGenerationInterface: ({ onImagesGenerated, onFileUploaded }: any) => (
    <div data-testid="unified-interface">
      <button 
        data-testid="trigger-upload"
        onClick={() => onImagesGenerated(['test-uploaded-image.jpg'], 'Uploaded: test.jpg')}
      >
        Trigger Upload
      </button>
      <button 
        data-testid="trigger-generation"
        onClick={() => onImagesGenerated(['generated-1.jpg', 'generated-2.jpg'], 'Generated landscape')}
      >
        Trigger Generation
      </button>
      <button 
        data-testid="trigger-file-callback"
        onClick={() => onFileUploaded(new File(['test'], 'test.jpg', { type: 'image/jpeg' }))}
      >
        Trigger File Callback
      </button>
    </div>
  )
}))

vi.mock('@/components/marketplace/ImagePipeline', () => ({
  ImagePipeline: () => <div data-testid="image-pipeline">Image Pipeline</div>
}))

// Mock Sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('AIModelMarketplace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders the main marketplace layout', () => {
      renderWithRouter(<AIModelMarketplace />)

      expect(screen.getByText('AI Model Marketplace')).toBeInTheDocument()
      expect(screen.getByText('Discover and use cutting-edge AI models with pipeline capabilities')).toBeInTheDocument()
      expect(screen.getByTestId('unified-interface')).toBeInTheDocument()
      expect(screen.getByTestId('trending-section')).toBeInTheDocument()
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
      expect(screen.getByTestId('category-filter')).toBeInTheDocument()
      expect(screen.getByTestId('model-grid')).toBeInTheDocument()
    })

    it('does not show image display section initially', () => {
      renderWithRouter(<AIModelMarketplace />)

      expect(screen.queryByTestId('multi-image-display')).not.toBeInTheDocument()
      expect(screen.queryByText(/Generated Images/)).not.toBeInTheDocument()
    })

    it('does not show pipeline section initially', () => {
      renderWithRouter(<AIModelMarketplace />)

      expect(screen.queryByTestId('image-pipeline')).not.toBeInTheDocument()
    })
  })

  describe('Image Upload Handling', () => {
    it('displays images when upload is triggered', async () => {
      const user = userEvent.setup()
      renderWithRouter(<AIModelMarketplace />)

      const uploadButton = screen.getByTestId('trigger-upload')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByTestId('multi-image-display')).toBeInTheDocument()
        expect(screen.getByTestId('image-count')).toHaveTextContent('Images: 1')
        expect(screen.getByTestId('image-prompt')).toHaveTextContent('Prompt: Uploaded: test.jpg')
        expect(screen.getByTestId('displayed-image-0')).toHaveAttribute('src', 'test-uploaded-image.jpg')
      })
    })

    it('shows correct header when images are uploaded', async () => {
      const user = userEvent.setup()
      renderWithRouter(<AIModelMarketplace />)

      const uploadButton = screen.getByTestId('trigger-upload')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByText('Generated Images (1)')).toBeInTheDocument()
      })
    })

    it('shows pipeline toggle button when images are present', async () => {
      const user = userEvent.setup()
      renderWithRouter(<AIModelMarketplace />)

      const uploadButton = screen.getByTestId('trigger-upload')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByText('Show Pipeline')).toBeInTheDocument()
      })
    })

    it('calls toast.success with correct message for uploads', async () => {
      const user = userEvent.setup()
      const { toast } = await import('sonner')
      
      renderWithRouter(<AIModelMarketplace />)

      const uploadButton = screen.getByTestId('trigger-upload')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Image uploaded successfully!')
      })
    })
  })

  describe('Image Generation Handling', () => {
    it('displays multiple generated images', async () => {
      const user = userEvent.setup()
      renderWithRouter(<AIModelMarketplace />)

      const generateButton = screen.getByTestId('trigger-generation')
      await user.click(generateButton)

      await waitFor(() => {
        expect(screen.getByTestId('image-count')).toHaveTextContent('Images: 2')
        expect(screen.getByTestId('image-prompt')).toHaveTextContent('Prompt: Generated landscape')
        expect(screen.getByTestId('displayed-image-0')).toHaveAttribute('src', 'generated-1.jpg')
        expect(screen.getByTestId('displayed-image-1')).toHaveAttribute('src', 'generated-2.jpg')
      })
    })

    it('shows correct header for multiple images', async () => {
      const user = userEvent.setup()
      renderWithRouter(<AIModelMarketplace />)

      const generateButton = screen.getByTestId('trigger-generation')
      await user.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Generated Images (2)')).toBeInTheDocument()
      })
    })

    it('calls toast.success with correct message for generation', async () => {
      const user = userEvent.setup()
      const { toast } = await import('sonner')
      
      renderWithRouter(<AIModelMarketplace />)

      const generateButton = screen.getByTestId('trigger-generation')
      await user.click(generateButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('2 images generated successfully!')
      })
    })
  })

  describe('Image Accumulation', () => {
    it('accumulates images from multiple operations', async () => {
      const user = userEvent.setup()
      renderWithRouter(<AIModelMarketplace />)

      // First upload an image
      const uploadButton = screen.getByTestId('trigger-upload')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByTestId('image-count')).toHaveTextContent('Images: 1')
      })

      // Then generate more images
      const generateButton = screen.getByTestId('trigger-generation')
      await user.click(generateButton)

      await waitFor(() => {
        expect(screen.getByTestId('image-count')).toHaveTextContent('Images: 3')
        expect(screen.getByText('Generated Images (3)')).toBeInTheDocument()
      })

      // Should have all three images displayed
      expect(screen.getByTestId('displayed-image-0')).toBeInTheDocument() // uploaded
      expect(screen.getByTestId('displayed-image-1')).toBeInTheDocument() // generated 1
      expect(screen.getByTestId('displayed-image-2')).toBeInTheDocument() // generated 2
    })
  })

  describe('Pipeline Functionality', () => {
    it('shows pipeline when toggle is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<AIModelMarketplace />)

      // Upload an image first
      const uploadButton = screen.getByTestId('trigger-upload')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByText('Show Pipeline')).toBeInTheDocument()
      })

      // Click the pipeline toggle
      const pipelineToggle = screen.getByText('Show Pipeline')
      await user.click(pipelineToggle)

      await waitFor(() => {
        expect(screen.getByTestId('image-pipeline')).toBeInTheDocument()
        expect(screen.getByText('Hide Pipeline')).toBeInTheDocument()
      })
    })

    it('hides pipeline when toggle is clicked again', async () => {
      const user = userEvent.setup()
      renderWithRouter(<AIModelMarketplace />)

      // Upload an image and show pipeline
      const uploadButton = screen.getByTestId('trigger-upload')
      await user.click(uploadButton)

      await waitFor(() => {
        const pipelineToggle = screen.getByText('Show Pipeline')
        user.click(pipelineToggle)
      })

      await waitFor(() => {
        expect(screen.getByText('Hide Pipeline')).toBeInTheDocument()
      })

      // Hide pipeline
      const hidePipelineButton = screen.getByText('Hide Pipeline')
      await user.click(hidePipelineButton)

      await waitFor(() => {
        expect(screen.queryByTestId('image-pipeline')).not.toBeInTheDocument()
        expect(screen.getByText('Show Pipeline')).toBeInTheDocument()
      })
    })
  })

  describe('Search and Filter Integration', () => {
    it('passes search query to ModelGrid', async () => {
      const user = userEvent.setup()
      renderWithRouter(<AIModelMarketplace />)

      const searchBar = screen.getByTestId('search-bar')
      await user.type(searchBar, 'flux')

      await waitFor(() => {
        expect(screen.getByTestId('model-grid')).toHaveTextContent('Search: flux')
      })
    })

    it('passes category filter to ModelGrid', async () => {
      const user = userEvent.setup()
      renderWithRouter(<AIModelMarketplace />)

      const categoryFilter = screen.getByTestId('category-filter')
      await user.selectOptions(categoryFilter, 'text-to-image')

      await waitFor(() => {
        expect(screen.getByTestId('model-grid')).toHaveTextContent('Models for: text-to-image')
      })
    })
  })

  describe('File Upload Callback', () => {
    it('handles file upload callback (legacy support)', async () => {
      const user = userEvent.setup()
      renderWithRouter(<AIModelMarketplace />)

      const fileCallbackButton = screen.getByTestId('trigger-file-callback')
      await user.click(fileCallbackButton)

      // The callback should not affect the UI since we're not using it
      // but it should not crash the component
      expect(screen.queryByTestId('multi-image-display')).not.toBeInTheDocument()
    })
  })
}) 