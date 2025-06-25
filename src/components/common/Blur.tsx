import React from 'react'

interface BlurProps {
  children: React.ReactNode
  className?: string
  intensity?: 'light' | 'medium' | 'heavy'
}

const Blur: React.FC<BlurProps> = ({ 
  children, 
  className = '', 
  intensity = 'medium' 
}) => {
  const blurClasses = {
    light: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md',
    heavy: 'backdrop-blur-lg'
  }

  return (
    <div className={`${blurClasses[intensity]} ${className}`}>
      {children}
    </div>
  )
}

export default Blur 