import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth, requireHead } from '../middleware/auth.js'
import { sweepInactive } from '../lib/activity.js'

const router = Router()

// Every route in this file is for signed-in admins only.
router.use(requireAuth, requireHead)

function publicIntern(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    status: row.status,
    signedUpAt: row.created_at,
  }
}

function fail(res, err) {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong. Please try again.' })
}

// Active interns only: these are the cards on the home page.
router.get('/', async (req, res) => {
  try {
    await sweepInactive()
    const result = await pool.query(
      `select id, first_name, last_name, email, status, created_at
       from users
       where user_type = 'intern' and status = 'active'
       order by first_name, last_name`
    )
    res.json({ interns: result.rows.map(publicIntern) })
  } catch (err) {
    fail(res, err)
  }
})

// Every intern, active or not, for the Activity page.
// This must stay above '/:id', or "activity" would be read as an id.
router.get('/activity', async (req, res) => {
  try {
    await sweepInactive()
    const result = await pool.query(
      `select id, first_name, last_name, email, status, created_at
       from users
       where user_type = 'intern'
       order by created_at desc`
    )
    res.json({ interns: result.rows.map(publicIntern) })
  } catch (err) {
    fail(res, err)
  }
})

// One intern, active or not. If they're inactive, also say which days
// their board should cover: from their first entry to their last.
router.get('/:id', async (req, res) => {
  try {
    await sweepInactive()

    const result = await pool.query(
      `select id, first_name, last_name, email, status, created_at
       from users
       where id = $1 and user_type = 'intern'`,
      [req.params.id]
    )
    const row = result.rows[0]
    if (!row) {
      return res.status(404).json({ error: 'Intern not found.' })
    }

    const intern = publicIntern(row)

    if (row.status === 'inactive') {
      const range = await pool.query(
        `select min(day_date)::text as first_day, max(day_date)::text as last_day
         from days
         where intern_id = $1
           and (subject <> ''
                or jsonb_array_length(tasks) > 0
                or jsonb_array_length(challenges) > 0
                or jsonb_array_length(solutions) > 0
                or jsonb_array_length(next_steps) > 0)`,
        [row.id]
      )
      const { first_day, last_day } = range.rows[0]
      intern.entryRange = first_day ? { first: first_day, last: last_day } : null
    }

    res.json({ intern })
  } catch (err) {
    // 22P02 means the id in the address wasn't a valid id at all
    if (err.code === '22P02') {
      return res.status(404).json({ error: 'Intern not found.' })
    }
    fail(res, err)
  }
})

export default router