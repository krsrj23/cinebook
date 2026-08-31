import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ title, onClose, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className={`relative z-10 max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-xl border border-cinema-700 bg-cinema-850 shadow-card`}>
        <div className="flex items-center justify-between border-b border-cinema-700 px-5 py-4">
          <h2 className="text-lg font-semibold text-cinema-50">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-cinema-400 hover:bg-cinema-800 hover:text-cinema-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
