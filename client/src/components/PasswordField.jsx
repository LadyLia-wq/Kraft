import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import Field from './Field'

function PasswordField(props) {
  const [visible, setVisible] = useState(false)

  return (
    <Field
      {...props}
      icon={Lock}
      type={visible ? 'text' : 'password'}
      right={
        <button
          type="button"
          className="field-toggle"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
    />
  )
}

export default PasswordField