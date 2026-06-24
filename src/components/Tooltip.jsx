import { useState } from 'react'

/* FUTURE: substituir por @radix-ui/react-tooltip
 * para posicionamento inteligente e acessibilidade. */
export default function Tooltip({ content, children, position = 'top' }) {
  const [show, setShow] = useState(false)

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  if (!content) return <>{children}</>

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`absolute z-50 ${positions[position]} px-2.5 py-1.5 rounded-lg bg-gray-900 dark:bg-gray-700 text-white text-xs whitespace-nowrap shadow-lg pointer-events-none`}
        >
          {content}
        </div>
      )}
    </div>
  )
}
