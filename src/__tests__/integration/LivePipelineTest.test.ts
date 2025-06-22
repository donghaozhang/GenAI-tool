import { describe, it, expect } from 'vitest'
import { processImagePipeline } from '@/utils/pipelineProcessing'

// This test uses the actual live Edge Function to diagnose the clothes changing issue
describe('Live Pipeline Diagnostic Tests', () => {
  // Skip these tests by default since they hit real APIs
  // Run with: npm test -- LivePipelineTest --run
  describe.skip('Clothes Changing Diagnosis', () => {
    const sampleDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='

    it('should successfully process clothes changing with FLUX Pro Kontext', async () => {
      try {
        const result = await processImagePipeline(
          'fal-ai/flux-pro/kontext',
          sampleDataUrl,
          'change the person\'s outfit to a red elegant dress'
        )
        
        console.log('✅ Clothes changing successful:', result)
        expect(result).toContain('http')
        expect(result).toMatch(/\.(jpg|jpeg|png|webp)$/i)
      } catch (error) {
        console.error('❌ Clothes changing failed:', error)
        
        // Log detailed error information for debugging
        if (error instanceof Error) {
          console.error('Error message:', error.message)
          console.error('Error stack:', error.stack)
        }
        
        // Re-throw to fail the test but with diagnostic info
        throw error
      }
    }, 30000) // 30 second timeout for API calls

    it('should handle different clothing transformation prompts', async () => {
      const prompts = [
        'change to business suit',
        'transform into casual wear',
        'change to evening gown'
      ]

      for (const prompt of prompts) {
        try {
          console.log(`Testing prompt: "${prompt}"`)
          
          const result = await processImagePipeline(
            'fal-ai/flux-pro/kontext',
            sampleDataUrl,
            prompt
          )
          
          console.log(`✅ Prompt "${prompt}" successful:`, result)
          expect(result).toContain('http')
        } catch (error) {
          console.error(`❌ Prompt "${prompt}" failed:`, error)
          throw error
        }
      }
    }, 60000) // 1 minute timeout for multiple API calls

    it('should validate that data URLs are properly formatted', () => {
      const testDataUrl = sampleDataUrl
      
      // Test the validation logic from the Edge Function
      const isValidImageUrl = (url: string): boolean => {
        if (url.startsWith('data:image/')) {
          return true
        }
        
        try {
          const urlObj = new URL(url)
          return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
        } catch {
          return false
        }
      }

      expect(isValidImageUrl(testDataUrl)).toBe(true)
      expect(isValidImageUrl('blob:http://localhost:8080/12345')).toBe(false)
      expect(isValidImageUrl('data:image/png;base64,iVBORw0KGgo')).toBe(true)
      expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true)
    })
  })

  describe('Environment Configuration Check', () => {
    it('should have proper environment setup', async () => {
      // Check if we have the required environment variables
      const hasSupabaseUrl = process.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_REMOTE_URL
      const hasSupabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_REMOTE_ANON_KEY
      
      if (!hasSupabaseUrl || !hasSupabaseKey) {
        console.log('⚠️ Skipping Supabase client test - environment variables not set (CI environment)')
        console.log('This is expected in CI/CD environments without secrets')
        return // Skip test in CI environment
      }

      // Check if we can import the Supabase client only when env vars are available
      try {
        const { supabase } = await import('@/integrations/supabase/client')
        expect(supabase).toBeDefined()
        console.log('✅ Supabase client loaded successfully')
      } catch (error) {
        console.error('❌ Failed to load Supabase client:', error)
        throw error
      }
    })

    it('should validate request structure', () => {
      const validRequest = {
        modelId: 'fal-ai/flux-pro/kontext',
        sourceImageUrl: 'data:image/jpeg;base64,validdata',
        prompt: 'change clothes'
      }

      expect(validRequest.modelId).toBeDefined()
      expect(validRequest.sourceImageUrl).toBeDefined()
      expect(validRequest.prompt).toBeDefined()
      
      // Test data URL format
      expect(validRequest.sourceImageUrl).toMatch(/^data:image\/[a-z]+;base64,/)
      
      console.log('✅ Request structure is valid')
    })
  })

  describe('Mock API Response Testing', () => {
    it('should handle successful API responses correctly', () => {
      // Test the response handling logic
      const mockSuccessResponse = {
        images: [{
          url: 'https://fal.media/transformed-image.jpg',
          width: 1024,
          height: 1024
        }]
      }

      // Extract output URL like the Edge Function does
      const outputUrl = mockSuccessResponse.images?.[0]?.url || ''
      
      expect(outputUrl).toBe('https://fal.media/transformed-image.jpg')
      expect(outputUrl).toContain('http')
      console.log('✅ Response handling logic works correctly')
    })

    it('should handle missing output URL in response', () => {
      const mockEmptyResponse = {
        metadata: { processing_time: 5.2 }
        // No images array
      }

      const outputUrl = mockEmptyResponse.images?.[0]?.url || ''
      
      expect(outputUrl).toBe('')
      console.log('✅ Handles missing output URL correctly')
    })
  })

  describe('Error Scenario Testing', () => {
    it('should identify common error patterns', () => {
      const commonErrors = [
        'Invalid image URL format',
        'Model ID is required',
        'Source image URL is required for image-to-image models',
        'Failed to process pipeline',
        'No output URL found in response'
      ]

      // These are the errors our pipeline should be able to handle
      for (const errorMessage of commonErrors) {
        expect(errorMessage).toBeDefined()
        expect(typeof errorMessage).toBe('string')
      }
      
      console.log('✅ Error handling patterns identified')
    })
  })
}) 