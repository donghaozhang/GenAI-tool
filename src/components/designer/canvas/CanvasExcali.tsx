import { saveCanvas, getCanvas } from '@/api/canvas'
import { useCanvas } from '@/contexts/CanvasContext'
import useDebounce from '@/hooks/jaaz/use-debounce'
import { useTheme } from '@/hooks/jaaz/use-theme'
import { eventBus } from '@/lib/event'
import * as ISocket from '@/types/socket'
import { CanvasData } from '@/types/types'
import { Excalidraw } from '@excalidraw/excalidraw'
import {
  ExcalidrawImageElement,
  OrderedExcalidrawElement,
  Theme,
} from '@excalidraw/excalidraw/element/types'
import '@excalidraw/excalidraw/index.css'
import {
  AppState,
  BinaryFileData,
  BinaryFiles,
  ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// import '@/assets/style/canvas.css' // TODO: Copy canvas styles

type LastImagePosition = {
  x: number
  y: number
  width: number
  height: number
  col: number // col index
}

type CanvasExcaliProps = {
  canvasId: string
  initialData?: ExcalidrawInitialDataState
}

const CanvasExcali: React.FC<CanvasExcaliProps> = ({
  canvasId,
  initialData,
}) => {
  const { excalidrawAPI, setExcalidrawAPI } = useCanvas()
  const [canvasData, setCanvasData] = useState<ExcalidrawInitialDataState | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { i18n } = useTranslation()

  const handleChange = useDebounce(
    (
      elements: Readonly<OrderedExcalidrawElement[]>,
      appState: AppState,
      files: BinaryFiles
    ) => {
      if (elements.length === 0 || !appState) {
        return
      }

      const data: CanvasData = {
        elements,
        appState: {
          ...appState,
          collaborators: undefined!,
        },
        files,
      }

      let thumbnail = ''
      const latestImage = elements
        .filter((element) => element.type === 'image')
        .sort((a, b) => b.updated - a.updated)[0]
      if (latestImage) {
        const file = files[latestImage.fileId!]
        if (file) {
          thumbnail = file.dataURL
        }
      }

      saveCanvas(canvasId, { data, thumbnail })
    },
    1000
  )

  const lastImagePosition = useRef<LastImagePosition | null>(
    localStorage.getItem('excalidraw-last-image-position')
      ? JSON.parse(localStorage.getItem('excalidraw-last-image-position')!)
      : null
  )
  const { theme } = useTheme()

  const addImageToExcalidraw = useCallback(
    async (imageElement: ExcalidrawImageElement, file: BinaryFileData) => {
      if (!excalidrawAPI) return

      excalidrawAPI.addFiles([file])

      const currentElements = excalidrawAPI.getSceneElements()
      console.log('👇 adding to currentElements', currentElements)
      excalidrawAPI.updateScene({
        elements: [...(currentElements || []), imageElement],
      })

      localStorage.setItem(
        'excalidraw-last-image-position',
        JSON.stringify(lastImagePosition.current)
      )
    },
    [excalidrawAPI]
  )

  const handleImageGenerated = useCallback(
    (imageData: ISocket.SessionImageGeneratedEvent) => {
      console.log('👇image_generated', imageData)
      if (imageData.canvas_id !== canvasId) {
        return
      }

      addImageToExcalidraw(imageData.element, imageData.file)
    },
    [addImageToExcalidraw]
  )

  // Load canvas data on mount
  useEffect(() => {
    const loadCanvasData = async () => {
      try {
        setIsLoading(true)
        const response = await getCanvas(canvasId)
        if (response?.data) {
          console.log('👇 Loaded canvas data:', response.data)
          
          // Load image files for Excalidraw
          const imageElements = response.data.elements?.filter(el => el.type === 'image') || []
          const files: BinaryFiles = {}
          
          for (const element of imageElements) {
            if (element.fileId) {
              try {
                const imageResponse = await fetch(`/api/file/${element.fileId}`)
                if (imageResponse.ok) {
                  const blob = await imageResponse.blob()
                  const dataURL = await new Promise<string>((resolve) => {
                    const reader = new FileReader()
                    reader.onload = () => resolve(reader.result as string)
                    reader.readAsDataURL(blob)
                  })
                  
                  files[element.fileId] = {
                    id: element.fileId,
                    dataURL,
                    mimeType: blob.type,
                    created: Date.now(),
                  }
                }
              } catch (error) {
                console.error(`Failed to load image ${element.fileId}:`, error)
              }
            }
          }
          
          const newCanvasData = {
            elements: response.data.elements || [],
            appState: response.data.appState || {},
            files,
          }
          
          console.log('👇 Setting canvas data:', newCanvasData)
          console.log('👇 Image elements found:', newCanvasData.elements.filter(el => el.type === 'image'))
          console.log('👇 Files loaded:', Object.keys(newCanvasData.files))
          
          setCanvasData(newCanvasData)
        }
      } catch (error) {
        console.error('Failed to load canvas data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCanvasData()
  }, [canvasId])

  useEffect(() => {
    eventBus.on('Socket::Session::ImageGenerated', handleImageGenerated)
    return () =>
      eventBus.off('Socket::Session::ImageGenerated', handleImageGenerated)
  }, [handleImageGenerated])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading canvas...</p>
        </div>
      </div>
    )
  }

  return (
    <Excalidraw
      key={canvasId + (canvasData ? '-loaded' : '-empty')} // Force re-render when data loads
      theme={theme as Theme}
      langCode={i18n.language}
      excalidrawAPI={(api) => {
        setExcalidrawAPI(api)
      }}
      onChange={handleChange}
      initialData={() => {
        const data = initialData || canvasData
        console.log('👇initialData being passed to Excalidraw:', data)
        if (data?.appState) {
          data.appState = {
            ...data.appState,
            collaborators: undefined!,
          }
        }
        return data || null
      }}
    />
  )
}
export default CanvasExcali
