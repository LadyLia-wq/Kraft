import { useState, useRef, useEffect } from 'react'
import AutoTextarea from './AutoTextarea'

function EditableText({ value, onSave, readOnly }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef(null)
  const finished = useRef(false)

  // Put the cursor at the end of the text when editing starts
  useEffect(() => {
    if (editing && ref.current) {
      const el = ref.current
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }
  }, [editing])

  function start() {
    finished.current = false
    setDraft(value)
    setEditing(true)
  }

  function save() {
    if (finished.current) return
    finished.current = true
    setEditing(false)
    const text = draft.trim()
    if (text && text !== value) onSave(text)
  }

  function cancel() {
    if (finished.current) return
    finished.current = true
    setEditing(false)
  }

  if (readOnly) return <span className="editable-text">{value}</span>

  if (editing) {
    return (
      <div className="edit-wrap">
        <AutoTextarea
          inputRef={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onSubmit={save}
          onBlur={save}
          onCancel={cancel}
        />
      </div>
    )
  }

  return (
    <span
      className="editable-text can-edit"
      role="button"
      tabIndex={0}
      title="Click to edit"
      onClick={start}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          start()
        }
      }}
    >
      {value}
    </span>
  )
}

export default EditableText