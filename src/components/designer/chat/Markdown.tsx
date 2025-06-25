import React from 'react'

interface MarkdownProps {
  children: string
  className?: string
}

const Markdown: React.FC<MarkdownProps> = ({ children, className = '' }) => {
  // Simple markdown rendering - you can enhance this with a proper markdown library
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />')
  }

  return (
    <div 
      className={`markdown ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(children) }}
    />
  )
}

export default Markdown 