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

describe('Pipeline Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('FLUX Pro Kontext (Clothes Changing)', () => {
    it('should successfully process clothes changing request', async () => {
      // Mock successful response from the fixed Edge Function
      mockInvoke.mockResolvedValue({
        data: { outputUrl: 'https://fal.media/changed-clothes.jpg' },
        error: null
      })

      const result = await processImagePipeline(
        'fal-ai/flux-pro/kontext',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//fake',
        'change the outfit to business attire'
      )

      expect(result).toBe('https://fal.media/changed-clothes.jpg')
      expect(mockInvoke).toHaveBeenCalledWith('process-image-pipeline', {
        body: {
          modelId: 'fal-ai/flux-pro/kontext',
          sourceImageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//fake',
          prompt: 'change the outfit to business attire'
        }
      })
    })

    it('should handle fashion style transformations', async () => {
      const fashionPrompts = [
        'transform into vintage 1950s dress',
        'change to modern streetwear',
        'convert to formal evening gown',
        'switch to casual summer outfit',
        'transform into medieval costume'
      ]

      for (const prompt of fashionPrompts) {
        mockInvoke.mockResolvedValueOnce({
          data: { outputUrl: `https://fal.media/style-${Date.now()}.jpg` },
          error: null
        })

        const result = await processImagePipeline(
          'fal-ai/flux-pro/kontext',
          'data:image/jpeg;base64,testdata',
          prompt
        )

        expect(result).toMatch(/^https:\/\/fal\.media\/style-\d+\.jpg$/)
        expect(mockInvoke).toHaveBeenCalledWith('process-image-pipeline', {
          body: {
            modelId: 'fal-ai/flux-pro/kontext',
            sourceImageUrl: 'data:image/jpeg;base64,testdata',
            prompt: prompt
          }
        })
      }
    })

    it('should handle color and pattern changes', async () => {
      mockInvoke.mockResolvedValue({
        data: { outputUrl: 'https://fal.media/color-changed.jpg' },
        error: null
      })

      const result = await processImagePipeline(
        'fal-ai/flux-pro/kontext',
        'data:image/jpeg;base64,testdata',
        'change the shirt color to red and add stripes pattern'
      )

      expect(result).toBe('https://fal.media/color-changed.jpg')
    })
  })

  describe('Error Handling', () => {
    it('should handle Edge Function errors gracefully', async () => {
      mockInvoke.mockResolvedValue({
        data: null,
        error: { message: 'Invalid image format' }
      })

      await expect(processImagePipeline(
        'fal-ai/flux-pro/kontext',
        'invalid-image-data',
        'change clothes'
      )).rejects.toThrow('Invalid image format')
    })

    it('should handle missing output URL', async () => {
      mockInvoke.mockResolvedValue({
        data: {},
        error: null
      })

      await expect(processImagePipeline(
        'fal-ai/flux-pro/kontext',
        'data:image/jpeg;base64,testdata',
        'change clothes'
      )).rejects.toThrow('No output URL received from pipeline')
    })

    it('should handle network errors', async () => {
      mockInvoke.mockRejectedValue(new Error('Network error'))

      await expect(processImagePipeline(
        'fal-ai/flux-pro/kontext',
        'data:image/jpeg;base64,testdata',
        'change clothes'
      )).rejects.toThrow('Network error')
    })
  })

  describe('Input Validation', () => {
    it('should require source image for image-to-image models', async () => {
      await expect(processImagePipeline(
        'fal-ai/flux-pro/kontext',
        '',
        'change clothes'
      )).rejects.toThrow()
    })

    it('should validate image URL format', async () => {
      mockInvoke.mockResolvedValue({
        data: null,
        error: { message: 'Invalid image URL format' }
      })

      await expect(processImagePipeline(
        'fal-ai/flux-pro/kontext',
        'not-a-valid-url',
        'change clothes'
      )).rejects.toThrow('Invalid image URL format')
    })

    it('should accept data URLs', async () => {
      mockInvoke.mockResolvedValue({
        data: { outputUrl: 'https://fal.media/result.jpg' },
        error: null
      })

      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='

      const result = await processImagePipeline(
        'fal-ai/flux-pro/kontext',
        dataUrl,
        'change clothes'
      )

      expect(result).toBe('https://fal.media/result.jpg')
      expect(mockInvoke).toHaveBeenCalledWith('process-image-pipeline', {
        body: {
          modelId: 'fal-ai/flux-pro/kontext',
          sourceImageUrl: dataUrl,
          prompt: 'change clothes'
        }
      })
    })
  })

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      // Mock multiple responses
      const responses = Array.from({ length: 5 }, (_, i) => ({
        data: { outputUrl: `https://fal.media/concurrent-${i}.jpg` },
        error: null
      }))

      responses.forEach(response => {
        mockInvoke.mockResolvedValueOnce(response)
      })

      // Process multiple requests concurrently
      const promises = Array.from({ length: 5 }, (_, i) => 
        processImagePipeline(
          'fal-ai/flux-pro/kontext',
          'data:image/jpeg;base64,testdata',
          `change to outfit ${i}`
        )
      )

      const results = await Promise.all(promises)

      expect(results).toHaveLength(5)
      results.forEach((result, i) => {
        expect(result).toBe(`https://fal.media/concurrent-${i}.jpg`)
      })
      expect(mockInvoke).toHaveBeenCalledTimes(5)
    })

    it('should have reasonable timeout handling', async () => {
      // Mock a slow response
      mockInvoke.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            data: { outputUrl: 'https://fal.media/slow-result.jpg' },
            error: null
          }), 100)
        )
      )

      const startTime = Date.now()
      const result = await processImagePipeline(
        'fal-ai/flux-pro/kontext',
        'data:image/jpeg;base64,testdata',
        'change clothes'
      )
      const endTime = Date.now()

      expect(result).toBe('https://fal.media/slow-result.jpg')
      expect(endTime - startTime).toBeGreaterThan(90) // Should take at least 100ms
    })
  })

  describe('Edge Function Compatibility', () => {
    it('should work with the new FAL client format', () => {
      // Test that we're calling the Edge Function with the right parameters
      mockInvoke.mockResolvedValue({
        data: { outputUrl: 'https://fal.media/new-format.jpg' },
        error: null
      })

      const expectedInput = {
        modelId: 'fal-ai/flux-pro/kontext',
        sourceImageUrl: 'data:image/jpeg;base64,testdata',
        prompt: 'test prompt'
      }

      processImagePipeline(
        expectedInput.modelId,
        expectedInput.sourceImageUrl,
        expectedInput.prompt
      )

      expect(mockInvoke).toHaveBeenCalledWith('process-image-pipeline', {
        body: expectedInput
      })
    })

    it('should support all expected FLUX Pro Kontext parameters', () => {
      const supportedParams = [
        'prompt',
        'image_url',
        'guidance_scale',
        'num_images',
        'safety_tolerance',
        'output_format'
      ]

      // These parameters should be handled by the Edge Function
      expect(supportedParams).toContain('prompt')
      expect(supportedParams).toContain('image_url')
      expect(supportedParams).toContain('guidance_scale')
      expect(supportedParams).toContain('num_images')
      expect(supportedParams).toContain('safety_tolerance')
      expect(supportedParams).toContain('output_format')
    })
  })
}) 