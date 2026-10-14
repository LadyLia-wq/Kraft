// import { useState } from 'react'
// import AutoTextarea from './AutoTextarea'
// import { ChevronRight, Trash2 } from 'lucide-react'
// import SectionHeading from './SectionHeading'
// import EditableText from './EditableText'

// function BulletList({ title, placeholder, items, onChange, onRemove, readOnly, icon }) {
//   const [newItem, setNewItem] = useState('')

//   function addItem() {
//     if (newItem.trim() === '') return
//     onChange([...items, { id: Date.now(), text: newItem }])
//     setNewItem('')
//   }

//   return (
//     <div className="bullet-list">
//       <SectionHeading icon={icon}>{title}</SectionHeading>

//       {!readOnly && (
//         <>
//           <AutoTextarea
//             value={newItem}
//             onChange={(e) => setNewItem(e.target.value)}
//             onSubmit={addItem}
//             placeholder={placeholder}
//           />
//           <button onClick={addItem}>Add</button>
//         </>
//       )}

//       {readOnly && items.length === 0 && (
//         <p className="entry-empty">Nothing entered</p>
//       )}

//       <ul className="chevron-list">
//         {items.map((item) => (
//           <li key={item.id}>
//             <ChevronRight size={16} aria-hidden="true" />
//             <EditableText
//               value={item.text}
//               readOnly={readOnly}
//               onSave={(text) =>
//                 onChange(items.map((i) => (i.id === item.id ? { ...i, text } : i)))
//               }
//             />
//             {!readOnly && (
//               <button
//                 type="button"
//                 className="icon-delete"
//                 aria-label="Delete item"
//                 onClick={() => onRemove(item.id)}
//               >
//                 <Trash2 size={16} />
//               </button>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }

// export default BulletList

import { useState } from 'react'
import { ChevronRight, Trash2 } from 'lucide-react'
import AutoTextarea from './AutoTextarea'
import EditableText from './EditableText'
import SectionHeading from './SectionHeading'
import WindowCard from './WindowCard'

function BulletList({ title, placeholder, items, onChange, onRemove, readOnly }) {
  const [newItem, setNewItem] = useState('')

  function addItem() {
    if (newItem.trim() === '') return
    onChange([...items, { id: Date.now(), text: newItem }])
    setNewItem('')
  }

  // Admins and locked days: a finished "window" with plain text
  if (readOnly) {
    return (
      <WindowCard title={title}>
        {items.length === 0 ? (
          <p className="entry-empty">Nothing entered</p>
        ) : (
          <ul className="chevron-list">
            {items.map((item) => (
              <li key={item.id}>
                <ChevronRight size={16} aria-hidden="true" />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        )}
      </WindowCard>
    )
  }

  // Interns on today and future days: editable
  return (
    <div className="bullet-list">
      <SectionHeading>{title}</SectionHeading>

      <AutoTextarea
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        onSubmit={addItem}
        placeholder={placeholder}
      />
      <button onClick={addItem}>Add</button>

      <ul className="chevron-list">
        {items.map((item) => (
          <li key={item.id}>
            <ChevronRight size={16} aria-hidden="true" />
            <EditableText
              value={item.text}
              onSave={(text) =>
                onChange(
                  items.map((i) => (i.id === item.id ? { ...i, text } : i))
                )
              }
            />
            <button
              type="button"
              className="icon-delete"
              aria-label="Delete item"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default BulletList