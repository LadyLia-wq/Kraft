import { useState, useRef } from 'react'
import BulletList from './BulletList'
import CommentSection from './CommentSection'
import ReactionBar from './ReactionBar'
import AutoTextarea from './AutoTextarea'

function DayView({ day, date, data, onChange, onAddComment, onToggleReaction, readOnly, user }) {
  const [newTask, setNewTask] = useState('')
  const taskInputRef = useRef(null)

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

  return (
    <>
      <section className="day-column">
        <h2>{day}</h2>
        <p className="day-date">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>

        <h3>Subject For The Day</h3>
        {readOnly ? (
          <p className={data.subject ? 'entry-text' : 'entry-empty'}>
            {data.subject || 'Nothing entered'}
          </p>
        ) : (
          <AutoTextarea
            className="subject-input"
            value={data.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            onSubmit={() => taskInputRef.current?.focus()}
            placeholder="Subject for the day"
          />
        )}

        <h3>Task For The Day</h3>

        {!readOnly && (
          <>
            <AutoTextarea
              inputRef={taskInputRef}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onSubmit={addTask}
              placeholder="Add a Task"
            />
            <button onClick={addTask}>Add</button>
          </>
        )}

        {readOnly && data.tasks.length === 0 && (
          <p className="entry-empty">Nothing entered</p>
        )}

        <ul className="task-list">
          {data.tasks.map((task) => (
            <li key={task.id}>
              {readOnly ? (
                <span className="tick">{task.done ? '☑' : '☐'}</span>
              ) : (
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />
              )}
              <span>{task.text}</span>
            </li>
          ))}
        </ul>

        <BulletList
          title="Challenges"
          placeholder="Add a challenge"
          items={data.challenges}
          onChange={(items) => onChange({ challenges: items })}
          readOnly={readOnly}
        />
        <BulletList
          title="Solutions"
          placeholder="Add a solution"
          items={data.solutions}
          onChange={(items) => onChange({ solutions: items })}
          readOnly={readOnly}
        />
        <BulletList
          title="Next Steps"
          placeholder="Add a next step"
          items={data.nextSteps}
          onChange={(items) => onChange({ nextSteps: items })}
          readOnly={readOnly}
        />

        <ReactionBar
          reactions={data.reactions}
          userId={user.id}
          onToggle={onToggleReaction}
        />
      </section>

      <CommentSection
        comments={data.comments}
        onAddComment={onAddComment}
      />
    </>
  )
}

export default DayView