import React from 'react'

interface Choice {
  id: string
  text: string
  value: string
}

interface MultiChoicePromptProps {
  choices: Choice[]
  onSelect: (choice: Choice) => void
  className?: string
}

const MultiChoicePrompt: React.FC<MultiChoicePromptProps> = ({
  choices,
  onSelect,
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => onSelect(choice)}
          className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-lg transition-colors"
        >
          {choice.text}
        </button>
      ))}
    </div>
  )
}

export default MultiChoicePrompt 