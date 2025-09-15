import express from 'express'
import {pool} from '../db.js'
import {auth} from '../middleware/auth.js'
import {allow} from '../middleware/roles.js'
const r=express.Router()
r.get('/',auth,async(req,res)=>{
  const q=req.query.q||''
  const [rows]=await pool.query('SELECT * FROM patients WHERE name LIKE ? OR patient_uid LIKE ? ORDER BY id DESC',[`%${q}%`,`%${q}%`])
  res.json(rows)
})
r.post('/',auth,allow('admin','receptionist'),async(req,res)=>{
  const {patient_uid,name,dob,gender,phone,address}=req.body
  if(!patient_uid||!name)return res.status(400).json({error:'bad_request'})
  try{
    const [x]=await pool.query('INSERT INTO patients (patient_uid,name,dob,gender,phone,address) VALUES (?,?,?,?,?,?)',[patient_uid,name,dob,gender,phone,address])
    res.json({id:x.insertId})
  }catch(e){
    res.status(400).json({error:'exists'})
  }
})
r.put('/:id',auth,allow('admin','receptionist'),async(req,res)=>{
  const {name,dob,gender,phone,address}=req.body
  await pool.query('UPDATE patients SET name=?,dob=?,gender=?,phone=?,address=? WHERE id=?',[name,dob,gender,phone,address,req.params.id])
  res.json({ok:true})
})
r.delete('/:id',auth,allow('admin'),async(req,res)=>{
  await pool.query('DELETE FROM patients WHERE id=?',[req.params.id])
  res.json({ok:true})
})
export default r