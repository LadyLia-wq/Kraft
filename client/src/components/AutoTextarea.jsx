import { useRef, useEffect } from 'react'

function AutoTextarea({
  value,
  onChange,
  onSubmit,
  placeholder,
  className = '',
  inputRef,
}) {
  const ownRef = useRef(null)
  const ref = inputRef || ownRef

  useEffect(() => {
    const el = ref.current
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value])

  function handleKeyDown(e) {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      onSubmit
    ) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <textarea
      ref={ref}
      rows={1}
      className={`auto-textarea ${className}`}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
    />
  )
}

export default AutoTextarea