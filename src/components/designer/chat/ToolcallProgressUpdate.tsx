import React from 'react'

interface ToolcallProgressUpdateProps {
  toolCallId: string
  progress: number
  message?: string
}

const ToolcallProgressUpdate: React.FC<ToolcallProgressUpdateProps> = ({
  toolCallId,
  progress,
  message = 'Processing...'
}) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {message}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}

export default ToolcallProgressUpdate 