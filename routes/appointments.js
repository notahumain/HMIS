import express from 'express'
import {pool} from '../db.js'
import {auth} from '../middleware/auth.js'
import {allow} from '../middleware/roles.js'
const r=express.Router()
r.get('/',auth,async(req,res)=>{
  const [rows]=await pool.query('SELECT a.id,a.patient_id,a.doctor_id,a.scheduled_at,a.notes,a.status,p.name patient,u.name doctor FROM appointments a JOIN patients p ON a.patient_id=p.id JOIN users u ON a.doctor_id=u.id ORDER BY a.scheduled_at DESC')
  res.json(rows)
})
r.post('/',auth,allow('admin','receptionist'),async(req,res)=>{
  const {patient_id,doctor_id,scheduled_at,notes}=req.body
  if(!patient_id||!doctor_id||!scheduled_at)return res.status(400).json({error:'bad_request'})
  const [x]=await pool.query('INSERT INTO appointments (patient_id,doctor_id,scheduled_at,notes) VALUES (?,?,?,?)',[patient_id,doctor_id,scheduled_at,notes])
  res.json({id:x.insertId})
})
r.put('/:id/status',auth,allow('admin','doctor'),async(req,res)=>{
  const {status}=req.body
  await pool.query('UPDATE appointments SET status=? WHERE id=?',[status,req.params.id])
  res.json({ok:true})
})
r.delete('/:id',auth,allow('admin'),async(req,res)=>{
  await pool.query('DELETE FROM appointments WHERE id=?',[req.params.id])
  res.json({ok:true})
})
export default r