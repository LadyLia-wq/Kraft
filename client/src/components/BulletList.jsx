import { useState } from 'react'
import AutoTextarea from './AutoTextarea'

function BulletList({ title, placeholder, items, onChange, readOnly }) {
  const [newItem, setNewItem] = useState('')

  function addItem() {
    if (newItem.trim() === '') return
    onChange([...items, { id: Date.now(), text: newItem }])
    setNewItem('')
  }

  return (
    <div className="bullet-list">
      <h3>{title}</h3>

      {!readOnly && (
        <>
          <AutoTextarea
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onSubmit={addItem}
            placeholder={placeholder}
          />
          <button onClick={addItem}>Add</button>
        </>
      )}

      {readOnly && items.length === 0 && (
        <p className="entry-empty">Nothing entered</p>
      )}

      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </div>
  )
}

export default BulletList