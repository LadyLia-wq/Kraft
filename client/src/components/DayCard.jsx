function DayCard({ name, date, data, active, onClick }) {
  const total = data.tasks.length
  const done = data.tasks.filter((task) => task.done).length

  return (
    <button
      className={active ? 'day-card active' : 'day-card'}
      onClick={onClick}
    >
      <strong>{name.slice(0, 3)}</strong>
      <span className="day-card-date">
        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
      <span className="day-card-subject">
        {data.subject || 'No subject yet'}
      </span>
      <span className="day-card-progress">
        {done}/{total} tasks
      </span>
    </button>
  )
}

export default DayCard