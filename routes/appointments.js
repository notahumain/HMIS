import express from 'express'
import pool from '../db.js'

const r = express.Router()

r.get('/', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.id,
            a.patient_id,
            a.doctor_id,
            a.scheduled_at,
            a.status,
            a.notes,
            p.name AS patient_name,
            u.name AS doctor_name
     FROM appointments a
     JOIN patients p ON p.id=a.patient_id
     JOIN users u ON u.id=a.doctor_id
     ORDER BY a.scheduled_at DESC
     LIMIT 100`
  )
  res.json({ items: rows, total: rows.length })
})

r.post('/', async (req, res) => {
  let { patient_id, doctor_id, doctor_name, scheduled_at, status, notes } = req.body || {}
  if (!patient_id || !scheduled_at) return res.status(400).json({ message: 'missing_fields' })
  if (!doctor_id && doctor_name) {
    const [u] = await pool.query('SELECT id FROM users WHERE name=? AND role="doctor" LIMIT 1', [doctor_name])
    if (!u.length) return res.status(400).json({ message: 'doctor_not_found' })
    doctor_id = u[0].id
  }
  if (!doctor_id) return res.status(400).json({ message: 'doctor_required' })
  const s = ['scheduled', 'completed', 'cancelled'].includes(status) ? status : 'scheduled'
  const [ins] = await pool.query(
    'INSERT INTO appointments (patient_id,doctor_id,scheduled_at,status,notes) VALUES (?,?,?,?,?)',
    [patient_id, doctor_id, scheduled_at, s, notes || null]
  )
  const [row] = await pool.query('SELECT id,patient_id,doctor_id,scheduled_at,status FROM appointments WHERE id=?', [ins.insertId])
  res.status(201).json(row[0])
})

r.put('/:id/status', async (req, res) => {
  const { status } = req.body || {}
  await pool.query('UPDATE appointments SET status=? WHERE id=?', [status || 'scheduled', req.params.id])
  res.json({ ok: true })
})

r.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM appointments WHERE id=?', [req.params.id])
  res.json({ ok: true })
})

export default r
