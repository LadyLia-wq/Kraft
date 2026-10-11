const reactionTypes = [
  { key: 'like', emoji: '👍', label: 'Like' },
  { key: 'love', emoji: '❤️', label: 'Love' },
  { key: 'fire', emoji: '🔥', label: 'Fire' },
]

function ReactionBar({ reactions, userName, onChange, disabled }) {
  function toggle(key) {
    const names = reactions[key]
    const updated = names.includes(userName)
      ? names.filter((name) => name !== userName)
      : [...names, userName]
    onChange({ ...reactions, [key]: updated })
  }

  return (
    <div className="reaction-bar">
      {reactionTypes.map(({ key, emoji, label }) => {
        const active = reactions[key].includes(userName)
        return (
          <button
            key={key}
            className={active ? 'reaction active' : 'reaction'}
            onClick={() => toggle(key)}
            title={label}
            disabled={disabled}
          >
            {emoji} {reactions[key].length}
          </button>
        )
      })}
    </div>
  )
}

export default ReactionBar