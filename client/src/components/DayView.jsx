import { useState, useRef, useEffect } from 'react'
import { Check, Trash2 } from 'lucide-react'
import BulletList from './BulletList'
import CommentSection from './CommentSection'
import ReactionBar from './ReactionBar'
import AutoTextarea from './AutoTextarea'
import EditableText from './EditableText'
import SectionHeading from './SectionHeading'
import WindowCard from './WindowCard'

function DayView({
  day,
  date,
  data,
  onChange,
  onAddComment,
  onToggleReaction,
  readOnly,
  user,
}) {
  const [newTask, setNewTask] = useState('')
  const taskInputRef = useRef(null)
  const [undo, setUndo] = useState(null)
  const undoTimer = useRef(null)

  useEffect(() => () => clearTimeout(undoTimer.current), [])

  function addTask() {
    if (newTask.trim() === '') return
    onChange({
      tasks: [...data.tasks, { id: Date.now(), text: newTask, done: false }],
    })
    setNewTask('')
  }

  function toggleTask(id) {
    onChange({
      tasks: data.tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      ),
    })
  }

  function removeItem(field, id) {
    const list = data[field]
    const index = list.findIndex((i) => i.id === id)
    if (index === -1) return

    clearTimeout(undoTimer.current)
    setUndo({ field, item: list[index], index, dateKey: date.getTime() })
    undoTimer.current = setTimeout(() => setUndo(null), 6000)
    onChange({ [field]: list.filter((i) => i.id !== id) })
  }

  function undoRemove() {
    if (!undo) return
    const list = data[undo.field]
    if (!list.some((i) => i.id === undo.item.id)) {
      const next = [...list]
      next.splice(Math.min(undo.index, next.length), 0, undo.item)
      onChange({ [undo.field]: next })
    }
    clearTimeout(undoTimer.current)
    setUndo(null)
  }

  return (
    <>
      <section className={readOnly ? 'day-column report' : 'day-column'}>
        <div className="day-top">
          <h2>{day}</h2>
          <span className="day-date">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {readOnly ? (
          /* Admins and locked days: finished "windows" */
          <div className="window-grid">
            <WindowCard title="Subject For The Day" className="wide">
              <p className={data.subject ? 'entry-text' : 'entry-empty'}>
                {data.subject || 'Nothing entered'}
              </p>
            </WindowCard>

            <WindowCard title="Task For The Day">
              {data.tasks.length === 0 ? (
                <p className="entry-empty">Nothing entered</p>
              ) : (
                <ul className="task-list">
                  {data.tasks.map((task) => (
                    <li key={task.id}>
                      <span
                        className={task.done ? 'check-box on' : 'check-box'}
                        role="img"
                        aria-label={task.done ? 'Done' : 'Not done'}
                      >
                        {task.done && <Check size={14} strokeWidth={3} />}
                      </span>
                      <span className="task-text">{task.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </WindowCard>

            <BulletList title="Challenges" items={data.challenges} readOnly />
            <BulletList title="Solutions" items={data.solutions} readOnly />
            <BulletList title="Next Steps" items={data.nextSteps} readOnly />
          </div>
        ) : (
          /* Interns on today and future days: editable */
          <>
            <SectionHeading>Subject For The Day</SectionHeading>
            <AutoTextarea
              className="subject-input"
              value={data.subject}
              onChange={(e) => onChange({ subject: e.target.value })}
              onSubmit={() => taskInputRef.current?.focus()}
              placeholder="Subject for the day"
            />

            <SectionHeading>Task For The Day</SectionHeading>
            <AutoTextarea
              inputRef={taskInputRef}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onSubmit={addTask}
              placeholder="Add a Task"
            />
            <button onClick={addTask}>Add</button>

            <ul className="task-list">
              {data.tasks.map((task) => (
                <li key={task.id}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id)}
                  />
                  <EditableText
                    value={task.text}
                    onSave={(text) =>
                      onChange({
                        tasks: data.tasks.map((t) =>
                          t.id === task.id ? { ...t, text } : t
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    className="icon-delete"
                    aria-label="Delete task"
                    onClick={() => removeItem('tasks', task.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>

            <BulletList
              title="Challenges"
              placeholder="Add a challenge"
              items={data.challenges}
              onChange={(items) => onChange({ challenges: items })}
              onRemove={(id) => removeItem('challenges', id)}
            />
            <BulletList
              title="Solutions"
              placeholder="Add a solution"
              items={data.solutions}
              onChange={(items) => onChange({ solutions: items })}
              onRemove={(id) => removeItem('solutions', id)}
            />
            <BulletList
              title="Next Steps"
              placeholder="Add a next step"
              items={data.nextSteps}
              onChange={(items) => onChange({ nextSteps: items })}
              onRemove={(id) => removeItem('nextSteps', id)}
            />
          </>
        )}

        <ReactionBar
          reactions={data.reactions}
          userId={user.id}
          onToggle={onToggleReaction}
        />
      </section>

      <CommentSection comments={data.comments} onAddComment={onAddComment} />

      {!readOnly && undo && undo.dateKey === date.getTime() && (
        <div className="undo-toast" role="status">
          <span>Item deleted</span>
          <button type="button" onClick={undoRemove}>
            Undo
          </button>
        </div>
      )}
    </>
  )
}

export default DayView