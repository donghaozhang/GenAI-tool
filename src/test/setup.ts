import '@testing-library/jest-dom'

// Mock URL.createObjectURL since it's not available in JSDOM
global.URL.createObjectURL = vi.fn((file: File) => {
  return `mock-url-${file.name}`
})

// Mock URL.revokeObjectURL
global.URL.revokeObjectURL = vi.fn()

// Mock File constructor for testing
global.File = class File {
  name: string
  size: number
  type: string
  lastModified: number

  constructor(parts: (string | Blob | ArrayBuffer | ArrayBufferView)[], filename: string, properties?: FilePropertyBag) {
    this.name = filename
    this.size = parts.reduce((acc, part) => acc + (part as any).length || 0, 0)
    this.type = properties?.type || ''
    this.lastModified = properties?.lastModified || Date.now()
  }
} as any

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
} 