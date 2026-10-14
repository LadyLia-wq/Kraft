import { useId } from 'react'

function Field({ label, icon: Icon, right, as = 'input', children, ...props }) {
  const id = useId()

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {Icon && <Icon size={16} className="field-icon" aria-hidden="true" />}
      {as === 'select' ? (
        <select id={id} {...props}>
          {children}
        </select>
      ) : (
        <input id={id} {...props} />
      )}
      {right}
    </div>
  )
}

export default Field