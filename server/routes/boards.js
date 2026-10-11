import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { isActiveIntern } from '../lib/activity.js'

const router = Router()
router.use(requireAuth)

const REACTION_TYPES = ['like', 'love', 'fire']

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

// Returns the five dates (Mon–Fri) for a week, or null if it isn't a real Monday.
function weekDates(monday) {
  if (!isValidDate(monday)) return null
  const start = new Date(`${monday}T00:00:00Z`)
  if (start.getUTCDay() !== 1) return null
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(start)
    d.setUTCDate(start.getUTCDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function todayUTC() {
  return new Date().toISOString().slice(0, 10)
}

// Admins can see any intern's board. An intern can only see their own.
function canAccess(auth, internId) {
  return auth.type === 'head' || auth.id === internId
}

function cleanItems(list, isTask) {
  if (!Array.isArray(list)) return []
  return list.slice(0, 100).map((item) => ({
    id: item.id,
    text: String(item.text ?? '').slice(0, 2000),
    ...(isTask ? { done: Boolean(item.done) } : {}),
  }))
}

async function isIntern(internId) {
  const result = await pool.query(
    `select 1 from users where id = $1 and user_type = 'intern'`,
    [internId]
  )
  return result.rows.length > 0
}

function fail(res, err) {
  // 22P02 = badly formed id, 23503 = id doesn't exist
  if (err.code === '22P02' || err.code === '23503') {
    return res.status(404).json({ error: 'Not found.' })
  }
  console.error(err)
  res.status(500).json({ error: 'Something went wrong. Please try again.' })
}

// Load one whole week: the five days, with their comments and reactions.
router.get('/:internId/week/:monday', async (req, res) => {
  const { internId, monday } = req.params

  if (!canAccess(req.auth, internId)) {
    return res.status(403).json({ error: 'You do not have access to this board.' })
  }
  const dates = weekDates(monday)
  if (!dates) {
    return res.status(400).json({ error: 'Invalid week.' })
  }

  try {
    const [daysResult, commentsResult, reactionsResult] = await Promise.all([
      pool.query(
        `select day_date::text as day_date, subject, tasks, challenges, solutions, next_steps
         from days
         where intern_id = $1 and day_date = any($2::date[])`,
        [internId, dates]
      ),
      pool.query(
        `select c.id, c.day_date::text as day_date, c.parent_id, c.body,
                u.first_name, u.last_name, u.role
         from comments c
         join users u on u.id = c.author_id
         where c.intern_id = $1 and c.day_date = any($2::date[])
         order by c.created_at`,
        [internId, dates]
      ),
      pool.query(
        `select day_date::text as day_date, type, user_id
         from reactions
         where intern_id = $1 and day_date = any($2::date[])`,
        [internId, dates]
      ),
    ])

    const toComment = (c) => ({
      id: c.id,
      author: `${c.first_name} ${c.last_name}`,
      role: c.role,
      text: c.body,
    })

    const days = dates.map((date) => {
      const row = daysResult.rows.find((r) => r.day_date === date)
      const dayComments = commentsResult.rows.filter((c) => c.day_date === date)

      const comments = dayComments
        .filter((c) => !c.parent_id)
        .map((c) => ({
          ...toComment(c),
          replies: dayComments
            .filter((r) => r.parent_id === c.id)
            .map(toComment),
        }))

      const reactions = { like: [], love: [], fire: [] }
      for (const r of reactionsResult.rows) {
        if (r.day_date === date) reactions[r.type].push(r.user_id)
      }

      return {
        date,
        subject: row?.subject ?? '',
        tasks: row?.tasks ?? [],
        challenges: row?.challenges ?? [],
        solutions: row?.solutions ?? [],
        nextSteps: row?.next_steps ?? [],
        comments,
        reactions,
      }
    })

    res.json({ days })
  } catch (err) {
    fail(res, err)
  }
})

// Save an intern's own day. Nobody else can edit it, and past days are locked.
router.put('/:internId/days/:date', async (req, res) => {
  const { internId, date } = req.params

  if (req.auth.type !== 'intern' || req.auth.id !== internId) {
    return res.status(403).json({ error: 'You can only edit your own board.' })
  }
  if (!isValidDate(date)) {
    return res.status(400).json({ error: 'Invalid date.' })
  }
    if (!(await isActiveIntern(internId))) {
    return res.status(403).json({
      error:
        'Your account is inactive after 2 weeks without entries. Sign out and sign in again to reactivate it.',
      code: 'inactive',
    })
  }
  if (date < todayUTC()) {
    return res.status(403).json({ error: 'Past days cannot be edited.' })
  }

  const { subject, tasks, challenges, solutions, nextSteps } = req.body

  try {
    await pool.query(
      `insert into days (intern_id, day_date, subject, tasks, challenges, solutions, next_steps)
       values ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb)
       on conflict (intern_id, day_date) do update set
         subject = excluded.subject,
         tasks = excluded.tasks,
         challenges = excluded.challenges,
         solutions = excluded.solutions,
         next_steps = excluded.next_steps,
         updated_at = now()`,
      [
        internId,
        date,
        String(subject ?? '').slice(0, 500),
        JSON.stringify(cleanItems(tasks, true)),
        JSON.stringify(cleanItems(challenges, false)),
        JSON.stringify(cleanItems(solutions, false)),
        JSON.stringify(cleanItems(nextSteps, false)),
      ]
    )

    const hasContent =
      String(subject ?? '').trim() !== '' ||
      [tasks, challenges, solutions, nextSteps].some(
        (list) => Array.isArray(list) && list.length > 0
      )
    if (hasContent) {
      await pool.query(
        'update users set last_active_at = now() where id = $1',
        [internId]
      )
    }
    
    res.json({ ok: true })
  } catch (err) {
    fail(res, err)
  }
})

// Add a comment, or a reply if parentId is given.
router.post('/:internId/days/:date/comments', async (req, res) => {
  const { internId, date } = req.params

  if (!canAccess(req.auth, internId)) {
    return res.status(403).json({ error: 'You do not have access to this board.' })
  }
  if (!isValidDate(date)) {
    return res.status(400).json({ error: 'Invalid date.' })
  }

  const text = String(req.body.text ?? '').trim()
  if (!text) {
    return res.status(400).json({ error: 'Write something first.' })
  }
  if (text.length > 2000) {
    return res.status(400).json({ error: 'That comment is too long.' })
  }

  try {
    if (!(await isIntern(internId))) {
      return res.status(404).json({ error: 'Not found.' })
    }

    const parentId = req.body.parentId || null
    if (parentId) {
      // A reply must point at a main comment on this same board and day.
      const parent = await pool.query(
        `select id from comments
         where id = $1 and intern_id = $2 and day_date = $3 and parent_id is null`,
        [parentId, internId, date]
      )
      if (parent.rows.length === 0) {
        return res.status(400).json({ error: 'That comment no longer exists.' })
      }
    }

    await pool.query(
      `insert into comments (intern_id, day_date, parent_id, author_id, body)
       values ($1, $2, $3, $4, $5)`,
      [internId, date, parentId, req.auth.id, text]
    )
    res.status(201).json({ ok: true })
  } catch (err) {
    fail(res, err)
  }
})

// Toggle a reaction on or off for the signed-in user.
router.post('/:internId/days/:date/reactions/:type', async (req, res) => {
  const { internId, date, type } = req.params

  if (!canAccess(req.auth, internId)) {
    return res.status(403).json({ error: 'You do not have access to this board.' })
  }
  if (!isValidDate(date) || !REACTION_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid request.' })
  }

  try {
    if (!(await isIntern(internId))) {
      return res.status(404).json({ error: 'Not found.' })
    }

    const removed = await pool.query(
      `delete from reactions
       where intern_id = $1 and day_date = $2 and user_id = $3 and type = $4`,
      [internId, date, req.auth.id, type]
    )
    if (removed.rowCount === 0) {
      await pool.query(
        `insert into reactions (intern_id, day_date, user_id, type)
         values ($1, $2, $3, $4)`,
        [internId, date, req.auth.id, type]
      )
    }
    res.json({ ok: true })
  } catch (err) {
    fail(res, err)
  }
})

export default router