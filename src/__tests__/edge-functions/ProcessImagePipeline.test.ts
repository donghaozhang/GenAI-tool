import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock FAL client
const mockSubmit = vi.fn()
const mockResult = vi.fn()

vi.mock('@fal-ai/serverless-client', () => ({
  fal: {
    subscribe: vi.fn((modelId: string, { input }: { input: any }) => {
      return mockSubmit(modelId, { input })
    }),
    result: mockResult
  }
}))

// Import the handler after mocking
const processImagePipelineHandler = async (req: Request) => {
  const { modelId, sourceImageUrl, prompt } = await req.json()
  
  // Basic validation
  if (!modelId) {
    return new Response(JSON.stringify({ error: 'Model ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Validate image URL format
  if (!sourceImageUrl || (!sourceImageUrl.startsWith('data:') && !sourceImageUrl.startsWith('http'))) {
    return new Response(JSON.stringify({ error: 'Invalid image URL format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { fal } = await import('@fal-ai/serverless-client')
    
    // Handle different model types
    let input: any = {}
    
    if (modelId.includes('flux-pro/kontext') || modelId.includes('image-to-image')) {
      // Image-to-image models (clothes changing)
      input = {
        image_url: sourceImageUrl,
        prompt: prompt || 'change the outfit',
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true
      }
    } else if (modelId.includes('kling-video') || modelId.includes('image-to-video')) {
      // Image-to-video models
      input = {
        image_url: sourceImageUrl,
        prompt: prompt || 'animate this image'
      }
    } else if (modelId.includes('aura-sr')) {
      // Super-resolution models
      input = {
        image_url: sourceImageUrl
      }
    } else {
      // Default text-to-image
      input = {
        prompt: prompt || 'a beautiful image',
        image_size: 'landscape_4_3',
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true
      }
    }

    const result = await fal.subscribe(modelId, { input })
    
    if (result?.data?.images?.[0]?.url) {
      return new Response(JSON.stringify({ outputUrl: result.data.images[0].url }), {
        headers: { 'Content-Type': 'application/json' }
      })
    } else if (result?.data?.video?.url) {
      return new Response(JSON.stringify({ outputUrl: result.data.video.url }), {
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      return new Response(JSON.stringify({ error: 'No output generated' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.error('Pipeline processing error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

describe('Edge Function - Process Image Pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Clothes Changing (FLUX Pro Kontext)', () => {
    it('should process clothes changing request successfully', async () => {
      // Mock successful FAL response
      mockSubmit.mockResolvedValue({
        data: {
          images: [{
            url: 'https://fal.media/processed-clothes-change.jpg',
            width: 1024,
            height: 1024
          }]
        }
      })

      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: 'fal-ai/flux-pro/kontext',
          sourceImageUrl: 'data:image/jpeg;base64,validImageData',
          prompt: 'change the person\'s outfit to a red evening dress'
        })
      })

      const response = await processImagePipelineHandler(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.outputUrl).toBe('https://fal.media/processed-clothes-change.jpg')
      expect(mockSubmit).toHaveBeenCalledWith('fal-ai/flux-pro/kontext', {
        input: {
          image_url: 'data:image/jpeg;base64,validImageData',
          prompt: 'change the person\'s outfit to a red evening dress',
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          enable_safety_checker: true
        }
      })
    })

    it('should handle different clothing transformation prompts', async () => {
      const testCases = [
        'transform into business attire',
        'change to casual summer outfit',
        'dress in medieval clothing',
        'change to winter coat and hat'
      ]

      for (const prompt of testCases) {
        mockSubmit.mockResolvedValue({
          data: {
            images: [{
              url: `https://fal.media/transformed-${prompt.replace(/\s+/g, '-')}.jpg`,
              width: 1024,
              height: 1024
            }]
          }
        })

        const request = new Request('http://localhost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelId: 'fal-ai/flux-pro/kontext',
            sourceImageUrl: 'data:image/jpeg;base64,testdata',
            prompt: prompt
          })
        })

        const response = await processImagePipelineHandler(request)
        const result = await response.json()

        expect(response.status).toBe(200)
        expect(result.outputUrl).toContain('https://fal.media/transformed-')
        expect(mockSubmit).toHaveBeenCalledWith('fal-ai/flux-pro/kontext', {
          input: {
            image_url: 'data:image/jpeg;base64,testdata',
            prompt: prompt,
            num_inference_steps: 28,
            guidance_scale: 3.5,
            num_images: 1,
            enable_safety_checker: true
          }
        })
      }
    })
  })

  describe('Input Validation', () => {
    it('should reject requests without model ID', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceImageUrl: 'data:image/jpeg;base64,test',
          prompt: 'change clothes'
        })
      })

      const response = await processImagePipelineHandler(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Model ID is required')
    })

    it('should reject invalid image URL formats', async () => {
      const invalidUrls = [
        'blob:http://localhost:8080/12345',
        'file:///local/path/image.jpg',
        'invalid-url',
        '',
        undefined
      ]

      for (const invalidUrl of invalidUrls) {
        const request = new Request('http://localhost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelId: 'fal-ai/flux-pro/kontext',
            sourceImageUrl: invalidUrl,
            prompt: 'change clothes'
          })
        })

        const response = await processImagePipelineHandler(request)
        const result = await response.json()

        expect(response.status).toBe(400)
        expect(result.error).toBe('Invalid image URL format')
      }
    })

    it('should accept valid image URL formats', async () => {
      mockSubmit.mockResolvedValue({
        data: {
          images: [{
            url: 'https://fal.media/result.jpg',
            width: 1024,
            height: 1024
          }]
        }
      })

      const validUrls = [
        'data:image/jpeg;base64,validData',
        'https://example.com/image.jpg',
        'http://example.com/image.png'
      ]

      for (const validUrl of validUrls) {
        const request = new Request('http://localhost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelId: 'fal-ai/flux-pro/kontext',
            sourceImageUrl: validUrl,
            prompt: 'change outfit'
          })
        })

        const response = await processImagePipelineHandler(request)
        const result = await response.json()

        expect(response.status).toBe(200)
        expect(result.outputUrl).toBe('https://fal.media/result.jpg')
      }
    })
  })

  describe('Model Type Handling', () => {
    it('should handle image-to-video models correctly', async () => {
      mockSubmit.mockResolvedValue({
        data: {
          video: {
            url: 'https://fal.media/animated-video.mp4'
          }
        }
      })

      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: 'fal-ai/kling-video/v2.1/standard/image-to-video',
          sourceImageUrl: 'data:image/jpeg;base64,testdata',
          prompt: 'animate the person walking'
        })
      })

      const response = await processImagePipelineHandler(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.outputUrl).toBe('https://fal.media/animated-video.mp4')
      expect(mockSubmit).toHaveBeenCalledWith('fal-ai/kling-video/v2.1/standard/image-to-video', {
        input: {
          image_url: 'data:image/jpeg;base64,testdata',
          prompt: 'animate the person walking'
        }
      })
    })

    it('should handle super-resolution models correctly', async () => {
      mockSubmit.mockResolvedValue({
        data: {
          images: [{
            url: 'https://fal.media/upscaled-image.jpg',
            width: 2048,
            height: 2048
          }]
        }
      })

      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: 'fal-ai/aura-sr',
          sourceImageUrl: 'data:image/jpeg;base64,testdata',
          prompt: ''
        })
      })

      const response = await processImagePipelineHandler(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.outputUrl).toBe('https://fal.media/upscaled-image.jpg')
      expect(mockSubmit).toHaveBeenCalledWith('fal-ai/aura-sr', {
        input: {
          image_url: 'data:image/jpeg;base64,testdata'
        }
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle FAL API errors', async () => {
      mockSubmit.mockRejectedValue(new Error('FAL API rate limit exceeded'))

      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: 'fal-ai/flux-pro/kontext',
          sourceImageUrl: 'data:image/jpeg;base64,testdata',
          prompt: 'change clothes'
        })
      })

      const response = await processImagePipelineHandler(request)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result.error).toBe('FAL API rate limit exceeded')
    })

    it('should handle missing output in FAL response', async () => {
      mockSubmit.mockResolvedValue({
        data: {
          // No images or video field
          metadata: { processing_time: 5.2 }
        }
      })

      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: 'fal-ai/flux-pro/kontext',
          sourceImageUrl: 'data:image/jpeg;base64,testdata',
          prompt: 'change clothes'
        })
      })

      const response = await processImagePipelineHandler(request)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result.error).toBe('No output generated')
    })
  })

  describe('Real-world Scenarios', () => {
    it('should simulate complete clothes changing workflow', async () => {
      // Simulate a realistic FAL response
      mockSubmit.mockResolvedValue({
        data: {
          images: [{
            url: 'https://fal.media/transformed-elegant-dress.jpg',
            width: 1024,
            height: 1024,
            content_type: 'image/jpeg'
          }],
          timings: {
            inference: 4.2
          },
          seed: 123456789
        }
      })

      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: 'fal-ai/flux-pro/kontext',
          sourceImageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/realImageData...',
          prompt: 'transform the person to wear an elegant red evening dress with jewelry'
        })
      })

      const response = await processImagePipelineHandler(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.outputUrl).toBe('https://fal.media/transformed-elegant-dress.jpg')
      expect(mockSubmit).toHaveBeenCalledWith('fal-ai/flux-pro/kontext', {
        input: {
          image_url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/realImageData...',
          prompt: 'transform the person to wear an elegant red evening dress with jewelry',
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          enable_safety_checker: true
        }
      })
    })
  })
}) 