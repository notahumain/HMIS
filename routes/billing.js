import express from 'express'
import pool from '../db.js'

const r = express.Router()

r.get('/', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.id AS bill_no,
            b.patient_id,
            p.name AS patient_name,
            b.amount,
            b.status,
            b.created_at
     FROM bills b
     JOIN patients p ON p.id=b.patient_id
     ORDER BY b.created_at DESC
     LIMIT 100`
  )
  res.json({ items: rows, total: rows.length })
})

r.get('/:id/items', async (req, res) => {
  const [rows] = await pool.query('SELECT id,bill_id,item,price,qty FROM bill_items WHERE bill_id=?', [req.params.id])
  res.json({ items: rows, total: rows.length })
})

r.post('/', async (req, res) => {
  const { patient_id, items } = req.body || {}
  if (!patient_id || !Array.isArray(items) || !items.length) return res.status(400).json({ message: 'missing_fields' })
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const amount = items.reduce((s, i) => s + (Number(i.price) * Number(i.qty || 1) || 0), 0)
    const [b] = await conn.query('INSERT INTO bills (patient_id,amount,status,created_at) VALUES (?,?,?,NOW())', [patient_id, amount, 'unpaid'])
    const billId = b.insertId
    for (const it of items) {
      await conn.query('INSERT INTO bill_items (bill_id,item,price,qty) VALUES (?,?,?,?)', [billId, String(it.item || ''), Number(it.price) || 0, Number(it.qty) || 1])
    }
    await conn.commit()
    const [row] = await conn.query('SELECT id AS bill_no, patient_id, amount, status, created_at FROM bills WHERE id=?', [billId])
    res.status(201).json(row[0])
  } catch (e) {
    await conn.rollback()
    res.status(400).json({ message: 'failed' })
  } finally {
    conn.release()
  }
})

r.put('/:id/pay', async (req, res) => {
  await pool.query('UPDATE bills SET status="paid" WHERE id=?', [req.params.id])
  res.json({ ok: true })
})

export default r
