import express from 'express'
import pool from '../db.js'

const r = express.Router()

r.get('/', async (req, res) => {
  const q = (req.query.q || '').trim()
  const [rows] = await pool.query(
    `SELECT p.id,
            p.patient_uid,
            p.name,
            p.phone,
            p.dob,
            p.gender,
            p.address,
            TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) AS age,
            (SELECT MAX(a.scheduled_at) FROM appointments a WHERE a.patient_id = p.id) AS last_visit
     FROM patients p
     WHERE (? = '' OR p.name LIKE CONCAT('%', ?, '%') OR p.patient_uid LIKE CONCAT('%', ?, '%') OR p.phone LIKE CONCAT('%', ?, '%'))
     ORDER BY p.id DESC
     LIMIT 100`,
    [q, q, q, q]
  )
  res.json({ items: rows, total: rows.length })
})

r.post('/', async (req, res) => {
  let { patient_uid, name, phone, dob, gender, address, age, last_visit } = req.body || {}
  if (!name) return res.status(400).json({ message: 'name_required' })
  if (!patient_uid) {
    const [u] = await pool.query('SELECT LPAD(COALESCE(MAX(id)+1,1),6,"0") uid FROM patients')
    patient_uid = 'PT' + u[0].uid
  }
  if (!dob && age) {
    const [d] = await pool.query('SELECT DATE_SUB(CURDATE(), INTERVAL ? YEAR) AS dob', [Number(age) || 0])
    dob = d[0].dob
  }
  const [ins] = await pool.query(
    'INSERT INTO patients (patient_uid,name,phone,dob,gender,address) VALUES (?,?,?,?,?,?)',
    [patient_uid, name, phone || null, dob || null, gender || null, address || null]
  )
  if (last_visit) {
    await pool.query('INSERT INTO appointments (patient_id,doctor_id,scheduled_at,status) VALUES (?,?,?,?)', [ins.insertId, 1, last_visit, 'completed'])
  }
  const [row] = await pool.query('SELECT id,patient_uid,name,phone,dob,gender,address FROM patients WHERE id=?', [ins.insertId])
  res.status(201).json(row[0])
})

r.put('/:id', async (req, res) => {
  const { name, phone, dob, gender, address } = req.body || {}
  await pool.query('UPDATE patients SET name=?, phone=?, dob=?, gender=?, address=? WHERE id=?', [name || null, phone || null, dob || null, gender || null, address || null, req.params.id])
  res.json({ ok: true })
})

r.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM patients WHERE id=?', [req.params.id])
  res.json({ ok: true })
})

export default r
