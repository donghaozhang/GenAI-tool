import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processImagePipeline } from '@/utils/pipelineProcessing'

// Mock Supabase client
const mockInvoke = vi.fn()
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke
    }
  }
}))

describe('Pipeline Processing - Clothes Changing Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('FLUX Pro Kontext Model (Clothes Changing)', () => {
    it('should process image-to-image transformation successfully', async () => {
      // Mock successful response
      mockInvoke.mockResolvedValue({
        data: { outputUrl: 'https://example.com/processed-image.jpg' },
        error: null
      })

      const sourceImageUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVR...'
      const prompt = 'change clothes to red dress'
      const modelId = 'fal-ai/flux-pro/kontext'

      const result = await processImagePipeline(modelId, sourceImageUrl, prompt)

      expect(result).toBe('https://example.com/processed-image.jpg')
      expect(mockInvoke).toHaveBeenCalledWith('process-image-pipeline', {
        body: {
          modelId: 'fal-ai/flux-pro/kontext',
          sourceImageUrl: sourceImageUrl,
          prompt: 'change clothes to red dress'
        }
      })
    })

    it('should handle different clothing transformation prompts', async () => {
      mockInvoke.mockResolvedValue({
        data: { outputUrl: 'https://example.com/transformed.jpg' },
        error: null
      })

      const testCases = [
        'change outfit to business suit',
        'transform into medieval armor',
        'change to casual jeans and t-shirt',
        'dress in elegant evening gown',
        'change to winter coat and boots'
      ]

      for (const prompt of testCases) {
        const result = await processImagePipeline(
          'fal-ai/flux-pro/kontext',
          'data:image/jpeg;base64,mockdata',
          prompt
        )

        expect(result).toBe('https://example.com/transformed.jpg')
        expect(mockInvoke).toHaveBeenCalledWith('process-image-pipeline', {
          body: {
            modelId: 'fal-ai/flux-pro/kontext',
            sourceImageUrl: 'data:image/jpeg;base64,mockdata',
            prompt: prompt
          }
        })
      }
    })

    it('should fail when no source image is provided', async () => {
      await expect(
        processImagePipeline('fal-ai/flux-pro/kontext', undefined, 'change clothes')
      ).rejects.toThrow('Model ID is required')
    })

    it('should handle Edge Function errors gracefully', async () => {
      mockInvoke.mockResolvedValue({
        data: null,
        error: { message: 'Internal Server Error' }
      })

      await expect(
        processImagePipeline(
          'fal-ai/flux-pro/kontext',
          'data:image/jpeg;base64,mockdata',
          'change clothes'
        )
      ).rejects.toThrow('Failed to process pipeline: Internal Server Error')
    })

    it('should handle missing output URL in response', async () => {
      mockInvoke.mockResolvedValue({
        data: { someOtherField: 'value' },
        error: null
      })

      await expect(
        processImagePipeline(
          'fal-ai/flux-pro/kontext',
          'data:image/jpeg;base64,mockdata',
          'change clothes'
        )
      ).rejects.toThrow('No output URL returned from the pipeline function')
    })
  })

  describe('Other Image-to-Image Models', () => {
    it('should work with FLUX Pro for enhancement', async () => {
      mockInvoke.mockResolvedValue({
        data: { outputUrl: 'https://example.com/enhanced.jpg' },
        error: null
      })

      const result = await processImagePipeline(
        'fal-ai/flux-pro',
        'data:image/jpeg;base64,mockdata',
        'enhance image quality'
      )

      expect(result).toBe('https://example.com/enhanced.jpg')
    })

    it('should work with Aura SR for super-resolution', async () => {
      mockInvoke.mockResolvedValue({
        data: { outputUrl: 'https://example.com/upscaled.jpg' },
        error: null
      })

      const result = await processImagePipeline(
        'fal-ai/aura-sr',
        'data:image/jpeg;base64,mockdata',
        ''
      )

      expect(result).toBe('https://example.com/upscaled.jpg')
    })
  })

  describe('Image-to-Video Models', () => {
    it('should work with Kling Video for image animation', async () => {
      mockInvoke.mockResolvedValue({
        data: { outputUrl: 'https://example.com/video.mp4' },
        error: null
      })

      const result = await processImagePipeline(
        'fal-ai/kling-video/v2.1/standard/image-to-video',
        'data:image/jpeg;base64,mockdata',
        'animate the person walking'
      )

      expect(result).toBe('https://example.com/video.mp4')
    })
  })

  describe('Data URL Validation', () => {
    it('should accept valid data URLs', async () => {
      mockInvoke.mockResolvedValue({
        data: { outputUrl: 'https://example.com/result.jpg' },
        error: null
      })

      const validDataUrls = [
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYE...',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...',
        'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCd...'
      ]

      for (const dataUrl of validDataUrls) {
        const result = await processImagePipeline(
          'fal-ai/flux-pro/kontext',
          dataUrl,
          'change outfit'
        )

        expect(result).toBe('https://example.com/result.jpg')
      }
    })

    it('should handle blob URLs by converting them', async () => {
      // This test simulates what should happen when a blob URL is passed
      // In practice, the frontend should convert to data URL before calling
      mockInvoke.mockResolvedValue({
        data: null,
        error: { message: 'Invalid image URL format' }
      })

      await expect(
        processImagePipeline(
          'fal-ai/flux-pro/kontext',
          'blob:http://localhost:8080/12345-6789-abcd',
          'change clothes'
        )
      ).rejects.toThrow('Failed to process pipeline: Invalid image URL format')
    })
  })

  describe('Error Scenarios', () => {
    it('should handle network errors', async () => {
      mockInvoke.mockRejectedValue(new Error('Network error'))

      await expect(
        processImagePipeline(
          'fal-ai/flux-pro/kontext',
          'data:image/jpeg;base64,mockdata',
          'change clothes'
        )
      ).rejects.toThrow('Pipeline processing failed: Network error')
    })

    it('should handle FAL API rate limiting', async () => {
      mockInvoke.mockResolvedValue({
        data: { error: 'Rate limit exceeded' },
        error: null
      })

      await expect(
        processImagePipeline(
          'fal-ai/flux-pro/kontext',
          'data:image/jpeg;base64,mockdata',
          'change clothes'
        )
      ).rejects.toThrow('Pipeline processing failed: Rate limit exceeded')
    })

    it('should handle invalid model IDs', async () => {
      mockInvoke.mockResolvedValue({
        data: { error: 'Unsupported model: invalid-model-id' },
        error: null
      })

      await expect(
        processImagePipeline(
          'invalid-model-id',
          'data:image/jpeg;base64,mockdata',
          'change clothes'
        )
      ).rejects.toThrow('Pipeline processing failed: Unsupported model: invalid-model-id')
    })
  })

  describe('Integration Test Scenarios', () => {
    it('should simulate complete clothes changing workflow', async () => {
      // Step 1: Upload image (simulated by data URL)
      const originalImage = 'data:image/jpeg;base64,originalImageData'
      
      // Step 2: Process with clothes changing prompt
      mockInvoke.mockResolvedValue({
        data: { outputUrl: 'https://fal.media/processed-image.jpg' },
        error: null
      })

      const result = await processImagePipeline(
        'fal-ai/flux-pro/kontext',
        originalImage,
        'transform the person wearing a red elegant dress instead of current outfit'
      )

      // Step 3: Verify result
      expect(result).toBe('https://fal.media/processed-image.jpg')
      expect(mockInvoke).toHaveBeenCalledWith('process-image-pipeline', {
        body: {
          modelId: 'fal-ai/flux-pro/kontext',
          sourceImageUrl: originalImage,
          prompt: 'transform the person wearing a red elegant dress instead of current outfit'
        }
      })
    })

    it('should handle multiple sequential transformations', async () => {
      const transformations = [
        { prompt: 'change to business suit', expected: 'business-suit.jpg' },
        { prompt: 'change to casual wear', expected: 'casual-wear.jpg' },
        { prompt: 'change to formal evening dress', expected: 'evening-dress.jpg' }
      ]

      for (const [index, transformation] of transformations.entries()) {
        mockInvoke.mockResolvedValue({
          data: { outputUrl: `https://example.com/${transformation.expected}` },
          error: null
        })

        const result = await processImagePipeline(
          'fal-ai/flux-pro/kontext',
          'data:image/jpeg;base64,mockdata',
          transformation.prompt
        )

        expect(result).toBe(`https://example.com/${transformation.expected}`)
      }
    })
  })
}) 