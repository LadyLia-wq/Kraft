import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { INACTIVE_AFTER_DAYS } from '../lib/activity.js'

const router = Router()

function makeToken(user) {
  return jwt.sign(
    { id: user.id, type: user.user_type },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

function publicUser(user) {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    type: user.user_type,
    email: user.email,
  }
}

router.post('/signup', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      accountType,
      roleTitle,
      accessCode,
      email,
      password,
      confirmPassword,
    } = req.body

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Please fill in all required fields.' })
    }
    if (!['intern', 'admin'].includes(accountType)) {
      return res.status(400).json({ error: 'Please choose Intern or Admin.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' })
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' })
    }

    let userType = 'intern'
    let role = 'Intern'

    if (accountType === 'admin') {
      if (!roleTitle?.trim()) {
        return res.status(400).json({ error: 'Please enter your role.' })
      }
      if (
        !process.env.ADMIN_ACCESS_CODE ||
        accessCode !== process.env.ADMIN_ACCESS_CODE
      ) {
        return res.status(403).json({ error: 'Invalid access code.' })
      }
      userType = 'head'
      role = roleTitle.trim()
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `insert into users (first_name, last_name, role, user_type, email, password_hash)
       values ($1, $2, $3, $4, $5, $6)
       returning *`,
      [
        firstName.trim(),
        lastName.trim(),
        role,
        userType,
        email.trim().toLowerCase(),
        passwordHash,
      ]
    )

    res.status(201).json({ message: 'Account created. Please sign in.' })
  } catch (err) {
    if (err.code === '23505') {
      return res
        .status(409)
        .json({ error: 'An account with this email already exists.' })
    }
    console.error(err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Enter your email and password.' })
    }

    const result = await pool.query('select * from users where email = $1', [
      email.trim().toLowerCase(),
    ])
    const user = result.rows[0]

    const passwordOk = user && (await bcrypt.compare(password, user.password_hash))
    if (!passwordOk) {
      return res.status(401).json({ error: 'Incorrect email or password.' })
    }
    
        if (user.user_type === 'intern') {
      await pool.query(
        `update users
         set status = 'active', last_active_at = now()
         where id = $1
           and (status = 'inactive'
                or last_active_at < now() - make_interval(days => $2::int))`,
        [user.id, INACTIVE_AFTER_DAYS]
      )
    }

    res.json({ token: makeToken(user), user: publicUser(user) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('select * from users where id = $1', [
      req.auth.id,
    ])
    if (!result.rows[0]) {
      return res.status(401).json({ error: 'Account not found.' })
    }
    res.json({ user: publicUser(result.rows[0]) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return res
        .status(400)
        .json({ error: 'First name, last name and email are required.' })
    }

    const result = await pool.query(
      `update users
       set first_name = $1, last_name = $2, email = $3
       where id = $4
       returning *`,
      [
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        req.auth.id,
      ]
    )

    if (!result.rows[0]) {
      return res.status(401).json({ error: 'Account not found.' })
    }

    res.json({ user: publicUser(result.rows[0]) })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That email is already in use.' })
    }
    console.error(err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please fill in all password fields.' })
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: 'New password must be at least 8 characters.' })
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match.' })
    }

    const result = await pool.query(
      'select password_hash from users where id = $1',
      [req.auth.id]
    )
    const user = result.rows[0]
    if (!user) {
      return res.status(401).json({ error: 'Account not found.' })
    }

    const currentOk = await bcrypt.compare(currentPassword, user.password_hash)
    if (!currentOk) {
      return res.status(400).json({ error: 'Your current password is incorrect.' })
    }

    const sameAsOld = await bcrypt.compare(newPassword, user.password_hash)
    if (sameAsOld) {
      return res
        .status(400)
                .json({ error: 'New password must be different from your current one.' })
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    await pool.query('update users set password_hash = $1 where id = $2', [
      newHash,
      req.auth.id,
    ])

    res.json({ message: 'Password updated.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

export default router