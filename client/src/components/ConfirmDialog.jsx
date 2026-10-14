import { useEffect, useRef } from 'react'

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null)

  // Open or close the real dialog whenever `open` changes
  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      onCancel={(e) => {
        // Escape key: let our own state close it
        e.preventDefault()
        onCancel()
      }}
      onClick={(e) => {
        // A click on the dimmed backdrop lands on the dialog itself
        if (e.target === ref.current) onCancel()
      }}
    >
      <div className="confirm-body">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button type="button" className="confirm-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="confirm-ok" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default ConfirmDialog