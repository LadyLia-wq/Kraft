import { useState } from 'react'

const variants = ['star']

function Loader({ full = false, variant }) {
  const [picked] = useState(
    () => variants[Math.floor(Math.random() * variants.length)]
  )
  const kind = variants.includes(variant) ? variant : picked

  return (
    <div
      className={full ? 'loader loader-full' : 'loader'}
      role="status"
      aria-live="polite"
    >
      {kind === 'star' && (
        <div className="ld-star" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <polygon
              points="12,2.5 14.9,9 21.5,9.6 16.5,14 18.2,20.8 12,17.2 5.8,20.8 7.5,14 2.5,9.6 9.1,9"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>
          <b />
        </div>
      )}

      {kind === 'dots' && (
        <div className="ld-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      )}

      {kind === 'squares' && (
        <div className="ld-squares" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
      )}

      <span className="sr-only">Loading</span>
    </div>
  )
}

export default Loader