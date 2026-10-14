import { useState } from 'react'

const reactionTypes = [
  { key: 'like', emoji: '👍', label: 'Like' },
  { key: 'love', emoji: '❤️', label: 'Love' },
  { key: 'fire', emoji: '🔥', label: 'Fire' },
]

// Eight sparks, spread evenly around a circle
const sparks = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2
  return {
    x: Math.round(Math.cos(angle) * 28),
    y: Math.round(Math.sin(angle) * 28),
  }
})

function ReactionBar({ reactions, userId, onToggle }) {
  // How many times each reaction has been switched on here. A new number
  // restarts the animation.
  const [plays, setPlays] = useState({})

  function handleClick(key) {
    if (!reactions[key].includes(userId)) {
      setPlays((p) => ({ ...p, [key]: (p[key] || 0) + 1 }))
    }
    onToggle(key)
  }

  return (
    <div className="reaction-bar">
      {reactionTypes.map(({ key, emoji, label }) => {
        const active = reactions[key].includes(userId)
        const played = plays[key] || 0

        return (
          <button
            key={key}
            className={active ? 'reaction active' : 'reaction'}
            onClick={() => handleClick(key)}
            title={label}
            aria-pressed={active}
          >
            <span className="em-wrap">
              <span key={played} className={played ? 'em pop' : 'em'}>
                {emoji}
              </span>
              {played > 0 && (
                <span key={`s${played}`} className="sparks" aria-hidden="true">
                  {sparks.map((s, i) => (
                    <span
                      key={i}
                      className="spark"
                      style={{ '--x': `${s.x}px`, '--y': `${s.y}px` }}
                    />
                  ))}
                </span>
              )}
            </span>
            <span>{reactions[key].length}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ReactionBar