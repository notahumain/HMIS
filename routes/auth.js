import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import cfg from '../config.js'

const r = express.Router()

r.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body || {}
  if (!name || !email || !password || !role) return res.status(400).json({ message: 'bad_request' })
  const hash = await bcrypt.hash(password, 10)
  try {
    const [x] = await pool.query('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)', [name, email, hash, role])
    res.status(201).json({ id: x.insertId })
  } catch {
    res.status(400).json({ message: 'exists' })
  }
})

r.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'bad_request' })
  const [rows] = await pool.query('SELECT id,name,email,password_hash,role FROM users WHERE email=?', [email])
  if (!rows.length) return res.status(401).json({ message: 'invalid' })
  const u = rows[0]
  const ok = await bcrypt.compare(password, u.password_hash)
  if (!ok) return res.status(401).json({ message: 'invalid' })
  const t = jwt.sign({ id: u.id, name: u.name, role: u.role }, cfg.jwtSecret, { expiresIn: '1d' })
  res.json({ token: t })
})

export default r
