import React from 'react'

interface Choice {
  id: string
  text: string
  value: string
}

interface SingleChoicePromptProps {
  choices: Choice[]
  onSelect: (choice: Choice) => void
  className?: string
}

const SingleChoicePrompt: React.FC<SingleChoicePromptProps> = ({
  choices,
  onSelect,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => onSelect(choice)}
          className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
        >
          {choice.text}
        </button>
      ))}
    </div>
  )
}

export default SingleChoicePrompt 