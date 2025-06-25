import React from "react"

/**
 * Google brand "G" logo, single-colour so it inherits the current
 * text colour (use Tailwind `text-white`, `text-gray-300`, etc.).
 */
export const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    aria-hidden
    viewBox="0 0 488 512"
    className="h-4 w-4"
    fill="currentColor"
    {...props}
  >
    <path d="M488 261.8c0-17.8-1.6-35-4.6-51.8H249v98h135.4c-5.8 31.4-23.5 58-50 75.9v62.9h80.7c47.3-43.6 73.9-107.8 73.9-184z" />
    <path d="M249 512c67.6 0 124.1-22.4 165.5-60.7l-80.7-62.9c-22.4 15-51.1 23.8-84.8 23.8-65 0-120.1-43.8-139.8-102.6H27.9v64.4C69.7 460.3 152.2 512 249 512z" />
    <path d="M109.2 309.6c-9.6-28.6-9.6-59.4 0-88l-64.4-64.4C9.6 205.1 0 235.7 0 268s9.6 62.9 26.8 111l82.4-69.4z" />
    <path d="M249 100.4c35.2 0 67.1 12.1 92.1 35.9l69.1-69.1C377 24.4 320.2 0 249 0 152.2 0 69.7 51.7 27.9 135.6l82.4 69.4C128.9 144.3 184 100.4 249 100.4z" />
  </svg>
) 