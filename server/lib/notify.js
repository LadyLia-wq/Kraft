import { pool } from '../db.js'

export async function notify({
  userId,
  actorId,
  ownerId,
  type,
  day,
  reaction = null,
}) {
    console.log('notify called', { userId, actorId, type })

    
  // Never notify people about their own actions.
  if (userId === actorId) return

  try {
    // Avoid spam when someone toggles the same reaction on and off.
    if (type === 'reaction') {
      const existing = await pool.query(
        `select 1 from notifications
         where user_id = $1 and actor_id = $2 and day = $3
           and type = 'reaction' and reaction = $4 and read_at is null`,
        [userId, actorId, day, reaction]
      )
      if (existing.rows.length > 0) return
    }

    await pool.query(
      `insert into notifications (user_id, actor_id, owner_id, type, day, reaction)
       values ($1, $2, $3, $4, $5, $6)`,
      [userId, actorId, ownerId, type, day, reaction]
    )
  } catch (err) {
    // A failed notification should never break the comment or reaction itself.
    console.error('Could not save notification', err)
  }
}