# Test Suite Documentation

This directory contains comprehensive tests for the GenAI tool application, focusing on the image upload functionality and component integration.

## Test Structure

```
src/__tests__/
├── components/
│   └── marketplace/
│       ├── PipelineProcessing.test.tsx
│       ├── UnifiedGenerationInterface.final.test.tsx
│       └── UnifiedGenerationInterface.test.tsx
├── diagnostics/
│   ├── ClothesChangingDiagnostic.test.ts
│   └── PipelineDiagnostic.js            # Browser console diagnostic tool
├── edge-functions/
│   └── ProcessImagePipeline.test.ts
├── integration/
│   ├── ClothesChangingIntegration.test.tsx
│   ├── ClothesChangingTest.test.ts
│   ├── LivePipelineTest.test.ts
│   └── PipelineIntegrationTest.test.ts
├── pages/
│   └── AIModelMarketplace.test.tsx
├── utils/
│   └── imageUpload.test.ts
└── README.md
```

## Test Configuration

The test suite uses:
- **Vitest** as the test runner
- **@testing-library/react** for component testing
- **@testing-library/jest-dom** for DOM assertions
- **jsdom** as the test environment

### Configuration Files
- `vitest.config.ts` - Main Vitest configuration
- `src/test/setup.ts` - Test setup and global mocks

## Test Coverage

### 1. Browser Console Diagnostic Tool (`diagnostics/PipelineDiagnostic.js`)
**Purpose**: Real-time pipeline debugging in browser console
- Tests FAL API key configuration
- Validates complete image generation pipeline
- Monitors request status and result fetching
- Provides fallback HTTP testing methods

**Usage:**
```javascript
// In browser console (F12):
// 1. Type 'allow pasting' and press Enter
// 2. Copy and paste the script content
// 3. The test will run automatically or call: runBrowserPipelineTest()
```

**What it tests:**
- Supabase Edge Function connectivity
- FAL API authentication and key validation
- Image submission to queue
- Status polling with proper authentication
- Result fetching and image URL generation
- Complete end-to-end pipeline workflow

### 2. Image Upload Utilities (`utils/imageUpload.test.ts`)
Tests core functionality related to image uploads:
- `URL.createObjectURL` behavior
- File object creation and validation
- Image upload workflow simulation
- Error handling scenarios

**Key Tests:**
- File URL creation for different image types (JPEG, PNG, WebP)
- File handling with special characters and edge cases
- Complete upload workflow simulation

### 3. UnifiedGenerationInterface Component (`components/marketplace/UnifiedGenerationInterface.final.test.tsx`)
Comprehensive tests for the main image upload component:
- Component rendering and UI elements
- File upload functionality and callbacks
- Integration with parent components
- Edge case handling

**Test Categories:**
- **Component Rendering**: Basic UI elements and accessibility
- **File Upload Functionality**: Core upload logic and file processing
- **Component State and Behavior**: UI state management
- **Integration Tests**: Parent-child component communication
- **Edge Cases**: Unusual filenames and error scenarios

**Key Features Tested:**
- File input element presence and configuration
- Object URL creation for uploaded files
- Callback function invocation with correct parameters
- Support for multiple image formats
- Proper error handling

### 4. AIModelMarketplace Page (`pages/AIModelMarketplace.test.tsx`)
Tests the main marketplace page and its integration with child components:
- Page layout and component integration
- Image display and management
- Pipeline functionality
- Search and filter integration

**Test Categories:**
- Component rendering and layout
- Image upload and generation handling
- Image accumulation from multiple operations
- Pipeline toggle functionality
- Search and filter integration

## Running Tests

### Available Scripts
```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Individual Test Files
```bash
# Run specific test file
npm run test:run src/__tests__/utils/imageUpload.test.ts
npm run test:run src/__tests__/components/marketplace/UnifiedGenerationInterface.final.test.tsx
npm run test:run src/__tests__/pages/AIModelMarketplace.test.tsx
```

## Mock Configuration

### Global Mocks (in `src/test/setup.ts`)
- `URL.createObjectURL` - Creates predictable URLs for testing
- `URL.revokeObjectURL` - Mock cleanup function
- `File` constructor - Custom implementation for test environment
- Console methods - Reduced noise during testing

### Component-Specific Mocks
- **Sonner toast**: Mocked for notification testing
- **Image generation service**: Mocked API responses
- **Child components**: Simplified implementations for isolation

## Key Test Patterns

### File Upload Testing
```typescript
// Create test file
const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

// Mock file selection
Object.defineProperty(fileInput, 'files', {
  value: [file],
  writable: false,
})

// Trigger change event
fireEvent.change(fileInput)

// Assert callback was called
expect(mockOnImagesGenerated).toHaveBeenCalledWith(
  ['mock-url-test.jpg'],
  'Uploaded: test.jpg'
)
```

### Component Integration Testing
```typescript
// Test parent-child communication
it('calls onImagesGenerated with correct parameters', () => {
  renderComponent()
  // ... upload file
  expect(mockOnImagesGenerated).toHaveBeenCalledTimes(1)
  expect(mockOnImagesGenerated).toHaveBeenCalledWith(expectedArgs)
})
```

## Test Results Summary

- **Total Tests**: 44 passing
- **Test Files**: 3 files
- **Coverage Areas**: 
  - Core upload utilities
  - Component rendering and interaction
  - Page-level integration
  - Error handling and edge cases

## Debugging Tests

### Common Issues
1. **RadixUI Components**: Complex UI components may require additional mocking
2. **File API**: Browser APIs need proper mocking in test environment
3. **Async Operations**: Use `waitFor` for async state updates

### Debug Tips
- Use `screen.debug()` to inspect rendered DOM
- Add `data-testid` attributes for reliable element selection
- Mock external dependencies to isolate component logic
- Use `vi.clearAllMocks()` between tests for clean state

## Future Enhancements

Potential areas for test expansion:
- End-to-end workflow testing
- Performance testing for large file uploads
- Accessibility testing with additional tools
- Visual regression testing
- Integration tests with real backend services

## Troubleshooting

### Test Environment Issues
- Ensure all dependencies are installed: `npm install`
- Check Vitest configuration in `vitest.config.ts`
- Verify test setup in `src/test/setup.ts`

### Mock Issues
- Update mocks when component APIs change
- Ensure global mocks are properly reset between tests
- Check that mock implementations match real behavior

For more information about the testing setup, see the main project documentation. 