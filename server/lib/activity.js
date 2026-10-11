import { pool } from '../db.js'

export const INACTIVE_AFTER_DAYS = 14

// Marks interns inactive when they have had no entries for 2 weeks.
export async function sweepInactive() {
  await pool.query(
    `update users
     set status = 'inactive'
     where user_type = 'intern'
       and status = 'active'
       and last_active_at < now() - make_interval(days => $1::int)`,
    [INACTIVE_AFTER_DAYS]
  )
}

export async function isActiveIntern(id) {
  await sweepInactive()
  const result = await pool.query(
    `select 1 from users
     where id = $1 and user_type = 'intern' and status = 'active'`,
    [id]
  )
  return result.rows.length > 0
}