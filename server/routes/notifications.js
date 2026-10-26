import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const list = await pool.query(
      `select n.id, n.type, n.day::text as day, n.reaction, n.owner_id,
              n.read_at, n.created_at, u.first_name, u.last_name
       from notifications n
       join users u on u.id = n.actor_id
       where n.user_id = $1
       order by n.created_at desc
       limit 30`,
      [req.auth.id]
    )
    const unread = await pool.query(
      `select count(*)::int as count from notifications
       where user_id = $1 and read_at is null`,
      [req.auth.id]
    )

    res.json({
      unread: unread.rows[0].count,
      notifications: list.rows.map((r) => ({
        id: r.id,
        type: r.type,
        day: r.day,
        reaction: r.reaction,
        ownerId: r.owner_id,
        read: Boolean(r.read_at),
        createdAt: r.created_at,
        actor: `${r.first_name} ${r.last_name}`,
      })),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

router.post('/read', async (req, res) => {
  try {
    await pool.query(
      `update notifications set read_at = now()
       where user_id = $1 and read_at is null`,
      [req.auth.id]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

router.post('/:id/read', async (req, res) => {
  try {
    await pool.query(
      `update notifications set read_at = now()
       where id = $1 and user_id = $2 and read_at is null`,
      [req.params.id, req.auth.id]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

export default router