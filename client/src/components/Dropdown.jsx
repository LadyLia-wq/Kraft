import { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, Check } from 'lucide-react'

function Dropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const wrapRef = useRef(null)
  const id = useId()

  const selectedIndex = options.findIndex((o) => o.value === value)
  const selected = options[selectedIndex]

  // Close when the person clicks anywhere outside the dropdown
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function openList() {
    setHighlight(Math.max(selectedIndex, 0))
    setOpen(true)
  }

  function choose(index) {
    onChange(options[index].value)
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((highlight + 1) % options.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((highlight - 1 + options.length) % options.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(highlight)
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div className="field dropdown" ref={wrapRef}>
      <label htmlFor={id}>{label}</label>

      <button
        type="button"
        id={id}
        className="dropdown-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
      >
        {selected?.label}
      </button>

      <ChevronDown
        size={16}
        className={open ? 'field-icon dropdown-chevron open' : 'field-icon dropdown-chevron'}
        aria-hidden="true"
      />

      {open && (
        <ul className="dropdown-list" id={`${id}-list`} role="listbox">
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={
                'dropdown-option' +
                (index === highlight ? ' highlighted' : '') +
                (option.value === value ? ' selected' : '')
              }
              onMouseEnter={() => setHighlight(index)}
              onClick={() => choose(index)}
            >
              <span>{option.label}</span>
              {option.value === value && <Check size={16} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Dropdown